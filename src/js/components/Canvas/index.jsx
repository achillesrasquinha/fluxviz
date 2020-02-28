import React from "react";
import PropTypes from "prop-types";

import { generateID } from "../../util/string";

class Canvas extends React.Component {
    constructor (props) {
        super (props);

        this.state = Canvas.defaultState;
    }

    componentDidMount ( ) {
        const container = this.refs.canvasContainer;

        const width     = container.clientWidth;
        const height    = container.clientHeight;

        this.setState({ width, height });
    }

    render ( ) {
        const { props, state }  = this;
        const { id, style }     = props;
        const { width, height } = state;

        return (
            <div ref="canvasContainer" className="container-canvas" style={style}>
                <canvas
                    id={id}
                    width={width}
                    height={height}/>
            </div>
        )
    }
};

Canvas.propTypes    = {
    id:     PropTypes.string,
    style:  PropTypes.object
};

Canvas.defaultProps = {
    id:     `canvas`
};

Canvas.defaultState = {

};

export default Canvas;