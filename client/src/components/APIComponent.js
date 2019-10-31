import React, { Component } from 'react';
import { apicall } from './utils/api';

class APIComponent extends Component {
    constructor(props) {
        super(props):
        this.state = {};
        apicall()
            .then(result=>this._mounted && this.setState({ result }))
            .catch(err=>this._mounted && this.setState({ err }));
    }
    componentDidMount() {
        this._mounted = true;
    }
    componentWillUnmount() {
        this._mounted = false;
    }
    render() {
        return (
            <div>Default</div>
        );
    }
}

export default APIComponent;