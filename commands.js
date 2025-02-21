export function handleCommand(line, odsVariables) {
    let output = "";
    let jsCode = "";

    // 변수 선언 (예: :: let "a" = 0 ..)
    if (line.startsWith(":: let ")) {
        let match = line.match(/:: let "(\w+)" = (.+) \.\.$/);
        if (match) {
            let varName = match[1];
            let varValue = match[2].trim();
            odsVariables[varName] = varValue;
            output += `변수 {${varName}}를 ${varValue}으로 저장.\n`;
            jsCode += `let ${varName} = ${varValue};\n`;
        } else {
            output += "오류: 변수 선언 형식이 잘못되었습니다.\n";
        }
    }

    // 출력 명령어 (예: :: print {a} ..)
    else if (line.startsWith(":: print ")) {
        let match = line.match(/:: print (.+) \.\.$/);
        if (match) {
            let content = match[1].trim();

            // 변수 처리 (예: {a} → 실제 값으로 변환)
            content = content.replace(/\{(\w+)\}/g, (match, varName) => {
                return odsVariables[varName] !== undefined ? odsVariables[varName] : `{${varName}}`;
            });

            output += `출력 결과: ${content}\n`;
            jsCode += `console.log(${content});\n`;
        } else {
            output += "오류: print 문 형식이 잘못되었습니다.\n";
        }
    }

    // 조건문 시작 (예: :: if {a} == 0 then)
    else if (line.startsWith(":: if ")) {
        let match = line.match(/:: if (\{.+\}) (==|!=|>|<|>=|<=) (.+) then$/);
        if (match) {
            let varName = match[1].replace(/\{|\}/g, "").trim(); // 중괄호 제거
            let operator = match[2];
            let conditionValue = match[3].trim();

            if (odsVariables[varName] !== undefined) {
                let conditionResult = eval(`${odsVariables[varName]} ${operator} ${conditionValue}`);
                output += `조건문 {${varName}} ${operator} ${conditionValue} => ${conditionResult ? "true" : "false"}.\n`;
                jsCode += `if (${odsVariables[varName]} ${operator} ${conditionValue}) {\n`;
            } else {
                output += `오류: 변수 {${varName}}가 정의되지 않았습니다.\n`;
            }
        } else {
            output += "오류: 올바른 if 문 형식이 아닙니다.\n";
        }
    }

    // 조건문 종료 (예: ..)
    else if (line === "..") {
        output += "조건문 종료.\n";
        jsCode += `}\n`;
    }

    // 반복문 (예: :: for {i} = 1 to 5 ..)
    else if (line.startsWith(":: for ")) {
        let match = line.match(/:: for (\{\w+\}) = (\d+) to (\d+) \.\.$/);
        if (match) {
            let varName = match[1].replace(/\{|\}/g, "").trim(); // 중괄호 제거
            let start = parseInt(match[2]);
            let end = parseInt(match[3]);

            odsVariables[varName] = start;
            output += `반복문 {${varName}} = ${start} to ${end}\n`;
            jsCode += `for (let ${varName} = ${start}; ${varName} <= ${end}; ${varName}++) {\n`;
        } else {
            output += "오류: 올바른 for 문 형식이 아닙니다.\n";
        }
    }

    // 연산자 처리 (예: :: let "sum" = {a} + 10 ..)
    else if (line.includes(" + ") || line.includes(" - ") || line.includes(" * ") || line.includes(" / ") || line.includes(" % ")) {
        let match = line.match(/:: let "(\w+)" = (.+) \.\.$/);
        if (match) {
            let varName = match[1];
            let expression = match[2];

            // 중괄호 `{}` 안의 변수를 실제 값으로 변환
            let evalExpression = expression.replace(/\{(\w+)\}/g, (match, varName) => {
                return odsVariables[varName] !== undefined ? odsVariables[varName] : `{${varName}}`;
            });

            let result = eval(evalExpression); // 연산 실행

            odsVariables[varName] = result;
            output += `변수 {${varName}} = ${result}\n`;
            jsCode += `let ${varName} = ${evalExpression};\n`;
        } else {
            output += "오류: 올바른 연산 형식이 아닙니다.\n";
        }
    }

    // 알 수 없는 명령어
    else {
        output += "알 수 없는 명령어: " + line + "\n";
    }

    return { output, jsCode };
}

