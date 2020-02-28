import React from "react";
import PropTypes from "prop-types";

import Canvas from "../Canvas"
import render from "../../model/render";

class ModelGraphView extends React.Component {
    async componentDidMount ( ) {
        const { props } = this;
        const { model } = props;

        await render("#graph", model);
    }

    render ( ) {
        const { props } = this;
        const { model } = props;

        return (
            <Canvas
                id="graph"
                style={{
                    width:  window.innerWidth,
                    height: window.innerHeight
                }}/>
        )
    }
};

ModelGraphView.propTypes = {
    model: PropTypes.object
};

export default ModelGraphView;