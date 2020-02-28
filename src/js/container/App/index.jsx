import React from "react";
import PropTypes from "prop-types";

import SideBar from "../../components/SideBar";
import ModelGraphView from "../../components/ModelGraphView";

class App extends React.Component {
    render ( ) {
        const { props } = this;
        const { model } = props;

        return (
            <div className="container-fluid p-0">
                <div className="row">
                    <div class="col-2">
                        <SideBar/>
                    </div>
                    <div class="col-10">
                        <ModelGraphView model={model}/>
                    </div>
                </div>
            </div>
        )
    }
};

App.propTypes = {
    model: PropTypes.object
}

export default App;