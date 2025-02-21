export function handleCommand(line, odsVariables) {
    let output = "";
    let jsCode = "";

    if (line.startsWith(":: let ")) {
        let parts = line.replace(":: let ", "").split(" ..");
        if (parts.length !== 2 || parts[1].trim() !== "") {
            output += "오류: '..' 뒤에 불필요한 문자가 있습니다.\n";
            return { output, jsCode };
        }

        let varAssignment = parts[0].split(" = ");
        if (varAssignment.length === 2) {
            let varName = varAssignment[0].trim();
            let varValue = varAssignment[1].trim();
            odsVariables[varName] = varValue;
            jsCode += `let ${varName} = ${varValue};\n`;
        } else {
            output += "오류: 변수 선언 형식이 잘못되었습니다.\n";
        }
    }
    else if (line.startsWith(":: print ")) {
        let content = line.replace(":: print ", "").trim();

        if (content.includes(" ..")) {
            let parts = content.split(" ..");
            if (parts.length > 2 || parts[1].trim() !== "") {
                output += "오류: '..' 뒤에 불필요한 문자가 있습니다.\n";
                return { output, jsCode };
            }
            content = parts[0].trim();
        } else {
            output += "오류: '..'이 필요합니다.\n";
            return { output, jsCode };
        }

        let resultText = "";
        let parts = content.split(/("[^"]*")/g).filter(Boolean);
        parts.forEach(part => {
            if (part.startsWith('"') && part.endsWith('"')) {
                resultText += part.slice(1, -1);
            } else {
                part = part.replace(/\{(\w+)\}/g, (match, varName) => {
                    return odsVariables[varName] !== undefined ? odsVariables[varName] : `{${varName}}`;
                });
                resultText += part;
            }
        });

        output += resultText + "\n";
        jsCode += `console.log(${content.replace(/\{(\w+)\}/g, "$1")});\n`;
    }
    else if (line.startsWith(":: for ")) {
        let match = line.match(/:: for (\w+) = (\d+) to (\d+) ..$/);
        if (match) {
            let varName = match[1];
            let start = parseInt(match[2]);
            let end = parseInt(match[3]);

            odsVariables[varName] = start;
            output += `${varName} 반복 시작 (${start}~${end})\n`;
            jsCode += `for (let ${varName} = ${start}; ${varName} <= ${end}; ${varName}++) {\n`;
        } else {
            output += "오류: 올바른 for 문 형식이 아닙니다.\n";
        }
    }
    else if (line.startsWith(":: while ")) {
        let match = line.match(/:: while (.+) ..$/);
        if (match) {
            let condition = match[1];
            output += `while 반복문 실행 (${condition})\n`;
            jsCode += `while (${condition}) {\n`;
        } else {
            output += "오류: 올바른 while 문 형식이 아닙니다.\n";
        }
    }
    else if (line.startsWith(":: if ")) {
        let match = line.match(/:: if (.+) then ..$/);
        if (match) {
            let condition = match[1];
            output += `조건 확인: ${condition}\n`;
            jsCode += `if (${condition}) {\n`;
        } else {
            output += "오류: 올바른 if 문 형식이 아닙니다.\n";
        }
    }
    else if (line.startsWith(":: else")) {
        output += "else 실행\n";
        jsCode += `} else {\n`;
    }
    else if (line.includes(" + ") || line.includes(" - ") || line.includes(" * ") || line.includes(" / ") || line.includes(" % ")) {
        let match = line.match(/(\w+) = (.+) ..$/);
        if (match) {
            let varName = match[1];
            let expression = match[2];

            let evalExpression = expression.replace(/\b(\w+)\b/g, match => odsVariables[match] || match);
            let result = eval(evalExpression);

            odsVariables[varName] = result;
            output += `${varName} = ${result}\n`;
            jsCode += `let ${varName} = ${evalExpression};\n`;
        } else {
            output += "오류: 올바른 연산 형식이 아닙니다.\n";
        }
    }
    else {
        output += "알 수 없는 명령어: " + line + "\n";
    }

    return { output, jsCode };
}
