from flask import Flask, request, redirect, render_template, abort, send_file
import os
import json
import tempfile

config = dict()
try:
    config = json.loads(os.path.join(os.path.realpath(__file__),"config.json"))
except:
    print("FAILED TO LOAD CONFIG")
    config = dict()

app = Flask(__name__)

@app.route('/favicon.ico')
def get_fav():
    return abort(404)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def get_list(path):
    
    # First, validate that they are logged in
    #  (and retrieve their username)
    SID = request.cookies.get("SID","")
    username = "user"
    if "AUTH_URL" in config and config["AUTH_URL"]:
        if SID == "":
            print("NO SID")
        else:
            print(SID)
    base_dir = config.get("BASE_DIR",os.path.join(tempfile.gettempdir(),"fsv"))
    
    # Next, figure out whether they're in a directory or getting a file
    paths = path.split('/')
    current_dir = paths[-1]
    if current_dir == "":
        islong = len(paths) > 6
        paths = paths[-6:] if islong else paths
        # What is the end directory (dirs always end in / so we need to cut off
        # the last "" as well)
        current_dir = paths[-2] if len(paths) > 1 else ""

        files = []
        dirs = []
        for filename in os.listdir(os.path.join(base_dir, username, path)):
            if os.path.isdir(os.path.join(base_dir, username, path, filename)):
                dirs.append(filename)
            else:
                files.append(filename)
        # This malarky is so the breadcrumbs display as / dir / dir2 / ...
        if len(paths) == 1:
            paths.append("")
        if not islong:
            paths.insert(0,"root")
        else:
            paths.insert(0,"...")
            paths.insert(0,"root")
        # This is to compute the back links in the directories
        opaths = []
        for path,i in zip(paths[:-2],range(len(paths[:-2]))):
            if path not in ["","..."]:
                opaths.append({ "name": path, "link": "../" * (len(paths[:-2])-i) })
            elif path == "root":
                opaths.append({ "name": path, "link": "/" })
            else:
                opaths.append({ "name": path })
        return render_template("file-list.html", current_dir=current_dir, dirs=dirs, files=files, paths=opaths)
    else:
        # Otherwise, send them the file
        fqp = os.path.join(base_dir, username, path)
        if os.path.isfile(fqp):
            return send_file(fqp)
        return abort(404)

@app.route('/', defaults={'path': ''}, methods=["POST"])
@app.route('/<path:path>/', methods=["POST"])
def modify_directory(path):
    print(request.form)
    return path
