import {useEffect, useState} from 'react';

function PromptHistory({key, activeTab, setTabs, onPromptsUpdate}) {

    const [prompts, setPrompts] = useState(() => {
        const saved = localStorage.getItem(`promptsHistory_${activeTab.id}`);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    });

    const [newPrompt, setNewPrompt] = useState('');
    const [newName, setNewName] = useState('');

    // 监听 prompts 变化并更新 localStorage
    // useEffect(() => {
    //     localStorage.setItem(`promptsHistory_${tab.id}`, JSON.stringify(prompts));
    // }, [prompts, tab.id]);

    // 添加提示到当前标签页
    const addPrompt = () => {
        if (!newPrompt.trim()) return;
        const newEntry = {name: newName.trim() || `Prompt ${prompts.length + 1}`, prompt: newPrompt};
        setTabs(tabs => {
            const updatedTabs = tabs.map(t => {
                if (t.id === activeTab.id) {
                    // 注意这里是在末尾添加新的提示
                    const updatedPrompts = [...t.prompts, newEntry];
                    // // 在当前tab找到时，也更新本组件的prompts状态
                    // if (tab.id === t.id) {
                    //     setPrompts(updatedPrompts);
                    // }
                    return {...t, prompts: updatedPrompts};
                }
                return t;
            });
            // 正确地更新localStorage
            // localStorage.setItem(`tabs`, JSON.stringify(updatedTabs));
            return updatedTabs;
        });
        setNewPrompt('');
        setNewName('');
    };


    useEffect(() => {
        console.log("Prompts have been updated:", prompts);
    }, [prompts]);


    // 删除当前标签页的一个提示
    const deletePrompt = (index) => {
        setTabs(tabs => {
            // 更新localStorage以反映删除操作，应该在map函数外部执行
            // localStorage.setItem(`tabs`, JSON.stringify(updatedTabs));

            return tabs.map(t => {
                if (t.id === activeTab.id) {
                    const updatedPrompts = t.prompts.filter((_, i) => i !== index);
                    // 在map函数内部，只是构建更新后的tabs数组
                    return {...t, prompts: updatedPrompts};
                }
                return t;
            });
        });
    };


    // 函数用于将内容添加到<textarea>
    const addToTextarea = (promptText) => {
        // 选择页面上的特定<textarea>元素
        const textarea = document.querySelector('textarea.fnzOi');
        if (textarea) {
            const existingContent = textarea.value;
            textarea.value = existingContent + promptText;
        }
    };
    // 函数用于将内容添加到<textarea>
    const replaceTextArea = (promptText) => {
        // 选择页面上的特定<textarea>元素
        const textarea = document.querySelector('textarea.fnzOi');
        if (textarea) {
            const existingContent = textarea.value;
            textarea.value = promptText;
        }
    };

    //用于维护prompt添加组建的显示和隐藏
    const [showInput, setShowInput] = useState(false);

    const updatePromptContent = (e, index) => {
        const updatedPromptText = e.target.innerText;
        // console.log("??");
        // 直接使用最上层的tabs状态来进行更新
        setTabs(tabs => {
            return tabs.map(tab => {
                console.log("现在扫到tab：");
                console.log(tab.id);
                console.log("现在的id是");
                console.log(key);
                if (tab.id === activeTab.id) { // 确保更新的是当前操作的tab
                    // console.log(tab);
                    const updatedPrompts = [...tab.prompts];
                    // console.log("看这里");
                    // console.log(tab);
                    updatedPrompts[index] = {...updatedPrompts[index], prompt: updatedPromptText};
                    // console.log(tab);
                    return {...tab, prompts: updatedPrompts};
                }
                return tab;
            });
        });
    };


    const updatePromptName = (e, index) => {
        const updatedName = e.target.innerText;

        // 直接使用最上层的tabs状态来进行更新
        setTabs(tabs => {
            return tabs.map(tab => {
                console.log("现在扫到tab：");
                console.log(tab.id);
                console.log("现在的id是");
                console.log(key);
                if (tab.id === activeTab.id) { // 确保更新的是当前操作的tab
                    const updatedPrompts = [...tab.prompts];
                    updatedPrompts[index] = {...updatedPrompts[index], name: updatedName};
                    console.log(updatedPrompts);
                    return {...tab, prompts: updatedPrompts};
                }
                return tab;
            });
        });

        // 不需要直接操作localStorage，应有一个集中的地方负责同步tabs到localStorage
    };


    return (
        <div style={{
            padding: '2px',
            backgroundColor: '#13152c',
            color: '#FFF',
        }}>
            <div>
                {activeTab.prompts.map((item, index) => (
                    <div key={index}>
                        {item && item.name && (
                            <div
                                contentEditable="true"
                                suppressContentEditableWarning={true}
                                onBlur={(e) => updatePromptName(e, index)}
                                dangerouslySetInnerHTML={{__html: item.name}}
                                style={{
                                    border: '1px solid #ccc',
                                    minHeight: '20px',
                                    cursor: 'text',
                                    padding: '5px',
                                    margin: '5px 0'
                                }}
                            />
                        )}
                        {item && item.prompt && (
                            <div>
                                <div
                                    contentEditable="true"
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => updatePromptContent(e, index)}
                                    dangerouslySetInnerHTML={{__html: item.prompt}}
                                    style={{
                                        border: '1px solid #ccc',
                                        minHeight: '20px',
                                        cursor: 'text',
                                        padding: '5px'
                                    }}
                                />
                            </div>
                        )}

                        {/*<span>{item.prompt}</span>*/}
                        <span className="asdasd">
                        <button className="enter-button" onClick={() => addToTextarea(item.prompt)}>
                            +
                        </button>
                        <button className="enter-button"
                                onClick={() => replaceTextArea(item.prompt)}>
                            use
                        </button>
                        <button className="bin-button" onClick={() => deletePrompt(index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 39 7"
                                 className="bin-top">
                                <line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"/>
                                <line strokeWidth="3" stroke="white" y2="1.5" x2="26.0357" y1="1.5" x1="12"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 33 39"
                                 className="bin-bottom">
                                <mask id="path-1-inside-1_8_19" fill="white">
                                    <path
                                        d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"/>
                                </mask>
                                <path mask="url(#path-1-inside-1_8_19)" fill="white"
                                      d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"/>
                                <path strokeWidth="4" stroke="white" d="M12 6L12 29"/>
                                <path strokeWidth="4" stroke="white" d="M21 6V29"/>
                            </svg>
                        </button>
                        </span>
                    </div>
                ))}
            </div>
            <button className="promptAddButton" onClick={() => setShowInput(!showInput)}>+</button>
            {showInput && (
                <div className='input-group1'>
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required="" type="text" name="text" autoComplete="off"
                        className="input"
                    />
                    <label className="user-label">Prompt</label>
                    <input
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        required="" type="text" name="text" autoComplete="off"
                        className="input"
                    />
                    <label className="user-label">Content</label>
                    <button onClick={addPrompt}>Add Prompt</button>
                </div>
            )}
        </div>
    );
}

export default PromptHistory;
