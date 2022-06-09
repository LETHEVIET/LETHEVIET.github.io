import { Component } from "react";
import React from "react";
import CodeEditor, { SelectionText } from "@uiw/react-textarea-code-editor";
import AceEditor from "react-ace";
import ReactJson from 'react-json-view'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faTerminal, faTree, faCertificate} from "@fortawesome/free-solid-svg-icons";
import {faJsSquare} from '@fortawesome/free-brands-svg-icons'

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"

import { Compiler } from "../compiler/complier";


class Main extends Component{

    constructor (props){
        super(props)
        this.state = {
            result: {
                success: true,
                log: 'wellcome to barebone complier',
                jsCode: '',
                astTree: {}
            },
            tabIndex: 0,
            astTree: {},
            code:
`init X = 10;
init Y = 9;
clear Z;
while X not 0 do
    incr Z;
    decr X;
end;
while Y not 0 do
    incr Z;
    decr Y;
end;`,
            // textRef: React.useRef()
        }

    }

    componentDidMount(){
        // if (this.state.textRef.current) {
        //     const obj = new SelectionText(this.state.textRef.current);
        //     console.log("obj:", obj);
        // }
    }

    onChange = (newValue)=>{
        this.setState({
            code: newValue
        })
    }

    onRun = () =>{
        console.log("run!")
        const result = Compiler(this.state.code)
        this.setState({
            result: result
        })
    }

    render() {
        return (<>
        <div id="Editor">
            <div id="Appbar">
                <div id="leftAppbar">
                    <div id="title">
                        Bare bone Complier
                    </div>
                    <div id="runbtn" onClick={this.onRun}>
                        <FontAwesomeIcon icon={faPersonRunning} />  Run
                    </div>
                </div>
                <div id="rightAppbar">
                    <div className="tab" style={{
                        backgroundColor: (this.state.tabIndex == 0) ? '#a7a7a7':'#dfdfdf'
                    }} onClick={()=>{this.setState({tabIndex: 0})}}>
                        <FontAwesomeIcon icon={faTerminal} /> Log
                    </div>

                    <div className="tab" style={{
                        backgroundColor: (this.state.tabIndex == 1) ? '#a7a7a7':'#dfdfdf'
                    }} onClick={()=>{this.setState({tabIndex: 1})}}>
                        <FontAwesomeIcon icon={faCertificate} /> Tokens
                    </div>

                    <div className="tab" style={{
                        backgroundColor: (this.state.tabIndex == 2) ? '#a7a7a7':'#dfdfdf'
                    }} onClick={()=>{this.setState({tabIndex: 2})}}>
                        <FontAwesomeIcon icon={faTree} /> AST
                    </div>

                    <div className="tab" style={{
                        backgroundColor: (this.state.tabIndex == 3) ? '#a7a7a7':'#dfdfdf'
                    }} onClick={()=>{this.setState({tabIndex: 3})}}>
                        <FontAwesomeIcon icon={faJsSquare} /> JavaScript
                    </div>

                    <div style={{
                        right: 0,
                        position: "absolute",
                        padding: "5px",
                        fontSize: "14px"
                    }} >
                        made by Soap
                    </div>
                </div>
            {/* <button onClick={this.onRun}>run</button> */}
            </div>
            <div id = "container">
                <div id = "leftPannel">
                    <AceEditor
                        value={this.state.code}
                        mode="javaScript"
                        theme="twilight"
                        onChange={this.onChange}
                        width='100%'
                        fontSize = {20}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{ $blockScrolling: true }}
                    />
                </div>
                <div id = "rightPannel">

                    {this.state.tabIndex === 0 &&
                        <div style={{backgroundColor: "black", height: "100%"}}>
                            <div id="terminal">
                                {this.state.result.log}
                            </div>
                        </div>
                    }

                    {this.state.tabIndex === 1 &&
                        <ReactJson 
                            src={this.state.result.tokens} 
                            collapsed = {true}
                            enableClipboard = {false}
                        />
                    }
                    
                    
                    {this.state.tabIndex === 2 &&
                        <ReactJson 
                            src={this.state.result.astTree} 
                            collapsed = {true}
                            enableClipboard = {false}
                        />
                    }
                    
                    {this.state.tabIndex === 3 &&
                        <div id="codeShower" >
                            {this.state.result.jsCode}
                        </div>
                    }
                    
                </div>
            </div>

            <div id="Appbar" style={{
                justifyContent: "space-around",
                padding: "5px"
            }}>
                CS111 - Nguyên Lý Và Phương Pháp Lập Trình
            </div>
        </div>
        </>)
    }
}

export default Main