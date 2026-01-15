import { useEffect, useState } from "react";
import { checkHeading, replaceHeadingStarts } from "../helper";
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import ReactMarkdown from 'react-markdown'

const Answer = ({ ans, totalResult, index, type }) => {
    const [heading, setHeading] = useState(false);
    const [answer, setAnswer] = useState(ans);


    useEffect(() => {
        console.log(ans);
        if (checkHeading(ans)) {
            setHeading(true);
            setAnswer(replaceHeadingStarts(ans))
        }
    }, [])

    const render={
        code({code, inline, className, children,...props}){
            const match =/language-(\w+)/.exec(className || '')
            return !inline && match?(
                <SyntaxHighlighter 
                    {...props}
                    children={String(children).replace(/\n$/,'')}
                    language = {match[1]}
                    style={dark}
                    preTag="div"
                />
            ):(
                <code {...props} className={className} >
                    {children}
                </code>
            )
        }
    }

    
    return (
        <>
        {
            index==0 && totalResult>1?<span className="pt-2 text-xl block text-white">{answer}</span>:
            heading?<span className={"pt-2 text-lg block text-white"}>{answer}</span>
                : <span className={type=='q'?'pl-1':'pl-5'}>
                    <ReactMarkdown components={render}>{answer}</ReactMarkdown>
                     </span>
        }
            
        </>
    )
}

export default Answer;