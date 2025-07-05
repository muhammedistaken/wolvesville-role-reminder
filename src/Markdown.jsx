import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Md = ({ children, className = '' }) => {
    return (
        <ReactMarkdown
            className={"markdown-body "+className}
            children={children}
            remarkPlugins={[remarkGfm]}
            components={{
                a: ({node, ...props}) => {
                    return (
                        <a {...props} target="_blank" rel="noopener noreferrer">
                            {props.children}
                        </a>
                    )
                }
            }}
        >
            {children}
        </ReactMarkdown>
    )
}

export default Md