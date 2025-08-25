
import React from 'react';
import type { MindMapNode } from '../types';

interface MindMapNodeProps {
    node: MindMapNode;
}

const MindMapNodeComponent: React.FC<MindMapNodeProps> = ({ node }) => {
    return (
        <li className="relative">
            <div className="inline-block bg-gray-700 text-white px-5 py-2.5 rounded-lg shadow-md border border-gray-600 mb-4 text-center">
                {node.text}
            </div>
            {node.children && node.children.length > 0 && (
                <ul className="pl-8 flex flex-col items-center">
                    {node.children.map((child, index) => (
                        <MindMapNodeComponent key={index} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
};


export const MindMapViewer: React.FC<{ root: MindMapNode }> = ({ root }) => {
    return (
        <div className="w-full h-full flex items-start justify-center p-8 overflow-auto bg-gray-800/50 rounded-xl">
            <div className="mindmap text-center">
                <ul>
                    <MindMapNodeComponent node={root} />
                </ul>
            </div>
            <style>{`
                .mindmap ul {
                    position: relative;
                    padding-top: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .mindmap li {
                    padding-top: 30px;
                    position: relative;
                    list-style-type: none;
                }
                /* Connector lines */
                .mindmap li::before, .mindmap li::after {
                    content: '';
                    position: absolute;
                    right: 50%;
                }
                /* Horizontal line */
                .mindmap li::before {
                    border-top: 2px solid #4b5563;
                    width: 0;
                    height: 30px;
                    top: 0;
                }
                /* Vertical line */
                .mindmap li::after {
                    border-right: 2px solid #4b5563;
                    height: 100%;
                    width: 0px;
                    top: -15px;
                }
                
                /* Remove connector from the root node */
                .mindmap > ul > li::before, .mindmap > ul > li::after {
                    display: none;
                }

                /* Connectors for children */
                .mindmap ul > li > ul {
                    flex-direction: row;
                    justify-content: center;
                    gap: 1rem;
                }
                 .mindmap ul > li > ul > li {
                     padding-top: 40px;
                 }
                
                .mindmap ul > li > ul > li::before {
                    width: 100%;
                    top: -10px;
                    right: 0;
                    border-top: none;
                    border-right: 2px solid #4b5563;
                    height: 100%;
                    border-top-right-radius: 10px;
                }

                .mindmap ul > li > ul > li::after {
                    border-top: 2px solid #4b5563;
                    width: 50%;
                    top: -10px;
                    right: 50%;
                }
                
                /* Style first and last child connectors */
                .mindmap ul > li > ul > li:first-child::after {
                    border-top-left-radius: 10px;
                    right: auto;
                    left: 0;
                }
                .mindmap ul > li > ul > li:last-child::after {
                    border-top-right-radius: 10px;
                }
                 .mindmap ul > li > ul > li:only-child::after {
                     width: 0;
                     border-radius: 0;
                 }

            `}</style>
        </div>
    );
};
