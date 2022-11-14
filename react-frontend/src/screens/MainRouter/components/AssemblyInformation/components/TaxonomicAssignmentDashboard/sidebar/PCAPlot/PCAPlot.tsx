import { Component } from 'react';
import Plot from 'react-plotly.js';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { fetchTaxaminerPCA } from '../../../../../../../../api';


interface Props {
	dataset_id: number
	assemblyID: number
	camera: any
	userID: number
	token: string
}

/**
 * Main Scatterplot Component
 */
class PCAPlot extends Component<Props, any> {
	constructor(props: any){
		super(props);
		this.state ={ 
			data: [] , // raw JSON data
			traces: [], // traces dicts for plotly
			selected_gene: "", // g_name
			aa_seq: "", // inherited
			ui_revision: "true", // bound to plot to preserve camera position
			auto_size: true, // automatically size dots in scatterplot
			marker_size: 5, // actual dot size in the plot
		}
	}

	/**
	 * Reload plot if dataset changed
	 * @param prevProps previous Props
	 * @param prevState previous State
	 * @param snapshot snapshot
	 */
	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
		if (prevProps.dataset_id != this.props.dataset_id) {
			fetchTaxaminerPCA(this.props.assemblyID, this.props.dataset_id, this.props.userID, this.props.token)
			.then(data => this.setState({ data: data}))
		}
	}

	/**
	 * This fixes a problem where some interactions reset the camera.
	 * Manually updating the uirevision state blocks plot resets
	 * @returns True (as required by OnLegendClick() => )
	 */
	lock_uirevision(){
		this.setState({ ui_revision: "true" })
		return(true)
	}

	set_color_palette(key: string){
		var locked = this.lock_uirevision()
		this.setState({color_palette: key})
	}


	/**
	 * Convert API data into plotly traces
	 * @param data API data
	 * @returns list of traces
	 */
	transformData (data: any[]) {

		// Avoid NoneType Exceptions
		if (data == null) {
			return []
		}

        const traces: any[] = []
        data.map(each => {
			// Setup the plot trace
            const trace = {
                type: 'scatter3d',
                mode: 'markers',
                x: each['x'],
                y: each['y'],
                z: each['z'],
                name: each['label'],
                text: each['label'],
				marker: {
					size: this.state.marker_size
				}
            }
            traces.push(trace)
        })
		return traces
	}

	/**
	 * Build the 3D scatterplot
	 * @returns Plotly Plot as React component
	 */
	build_plot() {
		return (
			<Plot
				divId='scatterplot'
					data = {this.transformData(this.state.data)}
					layout = {{
						autosize: true,
						showlegend: true,
						uirevision: this.state.ui_revision,
						scene: {camera: this.props.camera},
						// @ts-ignore
						// overrides are incomplete here, ignore for now
						legend: {itemsizing: 'constant'},
						}}
					useResizeHandler = {true}
    				style = {{width: "100%", height: "100%"}}
					onLegendClick={(e: any) => this.lock_uirevision()}
					config={{scrollZoom: true}}
				/>
		)
	}

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<Row>
				<Col>
					{this.build_plot()}
				</Col>
			</Row>
		)
	}
}

export default PCAPlot;