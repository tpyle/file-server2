from flask import Flask, request, redirect, render_template, abort, send_file
from werkzeug import secure_filename
import os
import uuid
import json
import tempfile

config = dict()
try:
    config = json.loads(os.path.join(os.path.realpath(__file__),"config.json"))
except:
    print("FAILED TO LOAD CONFIG")
    config = dict()

def get_base_dir(user):
    dirname = config.get("BASE_DIR",os.path.join(tempfile.gettempdir(),"fsv"))
    dirname = os.path.join(dirname,user)
    os.makedirs(dirname,exist_ok=True)
    return dirname

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
    base_dir = get_base_dir(username)
    
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
        for filename in os.listdir(os.path.join(base_dir, path)):
            if os.path.isdir(os.path.join(base_dir, path, filename)):
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
        return render_template("file-list.html", args=request.args, current_dir=current_dir, dirs=dirs, files=files, paths=opaths)
    else:
        # Otherwise, send them the file
        fqp = os.path.join(base_dir, path)
        if os.path.isfile(fqp):
            return send_file(fqp)
        return abort(404)

@app.route('/', defaults={'path': ''}, methods=["POST"])
@app.route('/<path:path>/', methods=["POST"])
def modify_directory(path):
    # Validate the user (and get their username)
    SID = request.cookies.get("SID","")
    username = "user"
    if "AUTH_URL" in config and config["AUTH_URL"]:
        if SID == "":
            print("NO SID")
        else:
            print(SID)
    base_dir = get_base_dir(username)

    renamed = False
    for f in request.files.to_dict(flat=False)['files']:
        name = secure_filename(f.filename)
        if name == "":
            name = str(uuid.uuid4())
            renamed = True
        if os.path.exists(os.path.join(base_dir,path,name)):
            ext = name[name.rfind('.'):] if name.rfind('.') else ""
            name = str(uuid.uuid4()) + ext
            renamed = True
        f.save(os.path.join(base_dir,path,name))
    if path != "" and path[-1] != "/":
        path = path + "/"
    return redirect("/" + path + ("?renamed=1" if renamed else ""),code=303)
