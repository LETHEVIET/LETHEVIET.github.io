import { clear } from "@testing-library/user-event/dist/clear"

const reservedWords = [
    "clear",
    "copy",
    "decr",
    "do",
    "end",
    "incr",
    "init",
    "not",
    "to",
    "while",
]

const getTokenType = (token) =>{
    if (reservedWords.includes(token.toLowerCase())) return "keyword"

    if (!isNaN(token)) return "number"

    if (token == '=') return "equal"

    return "identifier"
}

const tokenizier = (code) =>{
    
    let lines = code.split('\n')
    
    let tokens = []
    
    for (let i in lines){
        let line = lines[i]
        // console.log(line)


        let token = {
            name: '',
            value: '',
            line: i,
            start: -1,
            end: 0,
            type: ""
        }

        let hasComment = false
        
        for (let j in line){
            if (hasComment){
                break;
            }
            let char = line[j]
            
            const skipChar = ['\r', ' ', '\t', ';', '#']

            if (skipChar.includes(char)){
                if (char === '#'){
                    hasComment = true
                }
                

                if (token.value.length === 0 && char !== ';'){
                    token = {
                        name: '',
                        value: '',
                        line: i,
                        start: -1,
                        end: 0,
                        type: ""
                    }
                    continue;
                }

                if (token.value.length !== 0){
                    token.type = getTokenType(token.value)
                
                    if (token.type === 'keyword') token.name = token.value
                    else token.name = token.type

                    if (token.length !== 0) tokens.push(token)

                    token = {
                        name: '',
                        value: '',
                        line: i,
                        start: -1,
                        end: 0,
                        type: ""
                    }
                }

                if (char === ';'){
                    tokens.push({
                        name: 'semicolon',
                        value: ';',
                        line: i,
                        start: j,
                        end: j,
                        type: "semicolon"
                    })
                }
            }else{
                if (token.start == -1) token.start = j 
                token.end = j
                token.value += char
            }
        }


        if (token.start !== -1) {
            token.type = getTokenType(token.value)
            if (token.type === 'keyword') token.name = token.value
            else token.name = token.type
            tokens.push(token)
        }
    }

    console.log(tokens)
    return tokens
}

/*
    <whileBlock> -> <whileStatement> <endStatement>
    <whileStatement> -> <while> <identifier> <not> <number> <do> <semicolon>
    <endStatement> -> <end> <semicolon>
    <normalStatement> -> <copy> <identifier> <to> <identifier> <semicolon>
    <normalStatement> -> <clear> <identifier> <semicolon>
    <normalStatement> -> <incr> <identifier> <semicolon>
    <normalStatement> -> <decr> <identifier> <semicolon>
    <normalStatement> -> <init> <identifier> <equal> <number> <semicolon>
*/


const grammars = [
    {
        //<normalStatement> -> <copy> <identifier> <to> <identifier> <semicolon>
        type: "normalStatement",
        name: "copyStatement",
        rule: [ "copy", "identifier", "to", "identifier", "semicolon" ],
        nodeType: "leaf"
    },
    {
        //<normalStatement> -> <clear> <identifier> <semicolon>
        type: "normalStatement",
        name: "clearStatement",
        rule: ['clear', 'identifier', 'semicolon'],
        nodeType: "leaf"
    },
    {
        //<normalStatement> -> <incr> <identifier> <semicolon>
        type: "normalStatement",
        name: "incrStatement",
        rule: ["incr", "identifier", "semicolon"],
        nodeType: "leaf"
    },
    {
        //<normalStatement> -> <decr> <identifier> <semicolon>
        type: "normalStatement",
        name: "decrStatement",
        rule: ['decr', 'identifier', 'semicolon'],
        nodeType: "leaf"
    },
    {
        //<normalStatement> -> <init> <identifier> <equal> <number> <semicolon>
        type: "normalStatement",
        name: "initStatement",
        rule: ['init', 'identifier', 'equal', 'number', 'semicolon'],
        nodeType: "leaf"
    },
    {
        //<whileBlock> -> <whileStatement> <endStatement>
        type: "whileBlock",
        name: "whileBlock",
        rule: ['whileStatement', 'normalStatement', 'endStatement'],
        nodeType: "node"
    },
    {
        //<whileStatement> -> <while> <identifier> <not> <number> <do> <semicolon>
        type: "whileStatement",
        name: "whileStatement",
        rule: ['while', 'identifier', 'not', 'number', 'do'],
        nodeType: "leaf"
    },
    {
        //<endStatement> -> <end> <semicolon>
        type: "endStatement",
        name: "endStatement",
        rule: ['end', 'semicolon'],
        nodeType: "leaf"
    },
    {
        //<normalStatement> -> <normalStatement> <normalStatement>
        type: "normalStatement",
        name: "normalStatement",
        rule: ['normalStatement', 'normalStatement'],
        nodeType: "branches"
    },
    {
        //<normalStatement> -> <whileBlock> <normalStatement>
        type: "normalStatement",
        name: "normalStatement",
        rule: ['whileBlock'],
        nodeType: "branches"
    }
]

const checkGrammar = (statement, grammar) =>{
    if (statement.length != grammar.rule.length) return {
        matched: false,
        error: ''
    }

    let matched = true

    let missingToken = ''

    for (let i = 0; i < statement.length; i++){
        if (grammar.rule[i] !== statement[i].name) {
            missingToken = {
                name: grammar.rule[i],
                line: statement[i].line,
                start: statement[i].start,
                end: statement[i].end
            }
            matched = false
            break
        }
    }
    let error = ''
    if (reservedWords.includes(statement[0].name) && grammar.rule[0] === statement[0].name && matched === false){
        switch(missingToken.name){
            case 'identifier':
                error = `Invalid identifier, Detected in: line ${parseInt(missingToken.line) + 1}, start ${parseInt(missingToken.start)} , end ${parseInt(missingToken.end)}.`
                break;
            case 'semicolon':
                error = `Missing ; line ${parseInt(missingToken.line) + 1}, colunm ${parseInt(missingToken.start)}.`
                break;
            case 'number':
                error = `Invalid number, Detected in: line ${parseInt(missingToken.line) + 1}, start ${parseInt(missingToken.start)} , end ${parseInt(missingToken.end)}.`
                break;
            default:
                error = `Invalid syntax, Detected in: line ${parseInt(missingToken.line) + 1}, start ${parseInt(missingToken.start)} , end ${parseInt(missingToken.end)}.`   
        }
    }

    return {
        matched,
        error
    }
}

/*
clear <var>;	
incr <var>;	
decr <var>;	
while <var> not 0 do;
    <statements>
end;
copy <var> to <var>;
init <var> = value
*/

const exactInfo = (tokens, grammar) =>{
    switch (grammar.name){
        case "copyStatement":
            return {
                name: "copyStatement",
                var1: tokens[1].value,
                var2: tokens[3].value,
                tokens: tokens
            }
        case "clearStatement":
            return {
                name: "clearStatement",
                var: tokens[1].value,
                tokens: tokens
            }
        case "incrStatement":
            return {
                name: "incrStatement",
                var: tokens[1].value,
                tokens: tokens
            }
        case "decrStatement":
            return {
                name: "decrStatement",
                var: tokens[1].value,
                tokens: tokens
            }
        case "initStatement":
            return {
                name: "initStatement",
                var: tokens[1].value,
                value: tokens[3].value,
                tokens: tokens
            }
        case "whileBlock":
            return {
                name: "whileBlock",
                var: tokens[0].branchesList[0].var,
                stopValue: tokens[0].branchesList[0].stopValue,
                body: tokens[1].branchesList,
                tokens: tokens
            }
        case "whileStatement":
            return {
                name: "whileStatement",
                var: tokens[1].value,
                stopValue: tokens[3].value,
                tokens: tokens
            }
        case "endStatement":
            return {
                name: "endStatement",
                tokens: tokens
            }
    }
}

const shiftReduceParser = (tokens) =>{
    
    let stack = []
    let remains = tokens
    let currentToken = remains[0]
    remains = tokens.slice(1)

    let error = ''

    while (true){
        console.log(stack)

        if(error !== '') break
        
        let hasReduce = false
        for (let k = 0; k < stack.length; k++){
            if(error !== '') break
            let tmp = stack.slice(k)

            for (let m = 0; m < grammars.length; m++){
                let check = checkGrammar(tmp, grammars[m])

                if (check.matched){
                    stack = stack.slice(0,k)
                    let node 

                    switch (grammars[m].nodeType){
                        case "leaf":
                            node = {
                                name: grammars[m].type,
                                branchesList: [exactInfo(tmp, grammars[m])]
                            }
                            break
                        case "node":
                            node = {
                                name: grammars[m].type,
                                branchesList: [exactInfo(tmp, grammars[m])]
                                
                            }
                            break 
                        case "branches":
                            let branchesList = []
                            for (let i in tmp){
                                branchesList = branchesList.concat(tmp[i].branchesList)
                            }
                            node = {
                                name: grammars[m].type,
                                branchesList: branchesList
                            }
                            break;
                    }

                    stack.push(node)

                    hasReduce = true
                }else{
                    if (check.error.length !== 0) {
                        error = check.error
                        break
                    }
                }
            }
        }

        if (!hasReduce){
            if(currentToken === undefined){
                break
            }
            stack.push(currentToken)
            currentToken = remains[0]
            remains = remains.slice(1)
        }
    }

    if (stack.length === 1){
        return {
            success: true,
            astTree: stack[0].branchesList
        }
    }else{
        if (error === ''){
            return {
                success: false,
                message: 'Missing end statement.'
            }
        }
        return {
            success: false,
            message: error
        }
    }
}

const jsCodeGeneration = (branchesList, variables) =>{
    let jsCode = []
    for (const branch of branchesList){
        switch (branch.name){
            case "copyStatement":
                jsCode.push(`${branch.var2} = ${branch.var1} ;`) 

                if (!variables.includes(branch.var1)){
                    variables.push(branch.var1)
                }

                if (!variables.includes(branch.var2)){
                    variables.push(branch.var2)
                }
                break
            case "clearStatement":
                jsCode.push(`${branch.var} = 0 ;`)

                if (!variables.includes(branch.var)){
                    variables.push(branch.var)
                }
                break
            case "incrStatement":
                jsCode.push(`${branch.var} += 1 ;`)
                
                if (!variables.includes(branch.var)){
                    variables.push(branch.var)
                }
                break
            case "decrStatement":
                jsCode.push(`${branch.var} -= 1 ;`)
                
                if (!variables.includes(branch.var)){
                    variables.push(branch.var)
                }
                break
            case "initStatement":
                jsCode.push(`${branch.var} = ${branch.value} ;`)
                
                if (!variables.includes(branch.var)){
                    variables.push(branch.var)
                }
                break
            case "whileBlock":
                jsCode.push(`while (${branch.var} !== 0) {`)
                let body = jsCodeGeneration(branch.body, variables)
                for (let i in body){
                    body[i] = '\t' + body[i]
                }
                jsCode = jsCode.concat(body)
                jsCode.push('}')
                
                if (!variables.includes(branch.var)){
                    variables.push(branch.var)
                }
                break
        }
    }

    return jsCode
}

const javaScriptCodeGenerator = (astTree) =>{
    let variables = []
    
    const lines =  jsCodeGeneration(astTree, variables)

    let variablesDeclare = ''
    for (let variable of variables) variablesDeclare += 'let ' + variable + ' = 0 ;\n'
    
    let jsCode = variablesDeclare
    for (let line of lines) jsCode += line + '\n'

    for (let variable of variables) jsCode += 'console.log("value of ' + variable + ' : ", ' + variable + ');\n'
    console.log(jsCode)
    return {jsCode, variables}
}

const excuteJsCode = (jsCode, variableList) =>{
    let returnCode = 'return ['
    for (let variable of variableList){
        returnCode += `{name: "${variable}", value:  ${variable}}, `
    }
    returnCode += ']'

    console.log(jsCode + returnCode)
    return new Function(jsCode + returnCode)()
}

export const Compiler = (code) =>{
    const tokens = tokenizier(code)
    const res = shiftReduceParser(tokens)
    if (res.success){
        let script = javaScriptCodeGenerator(res.astTree)
        //console.log(script.jsCode, script.variables)
        let variables = excuteJsCode(script.jsCode, script.variables)
        console.log(variables)
        let log = ''
        for (let variable of variables){
            log += 'Value of ' + variable.name + ' : ' + variable.value + '\n';
        }
        console.log(log)
        return {
            success: true,
            log: log,
            astTree: res.astTree,
            jsCode: script.jsCode,
            tokens: tokens
        }
    }else{
        return {
            success: false,
            log: res.message,
            astTree: {},
            jsCode: '',
            tokens: []
        }
    }
}