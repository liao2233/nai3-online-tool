import {useEffect, useState} from 'react';

function PromptHistory({tab, setTabs}) {

    const [prompts] = useState(() => {
        const saved = localStorage.getItem(`promptsHistory_${tab.id}`);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    });

    const [newPrompt, setNewPrompt] = useState('');
    const [newName, setNewName] = useState('');
    // const [position, setPosition] = useState({x: 20, y: 20});
    // const [isDragging, setIsDragging] = useState(false);

    // const handleDragStart = (e) => {
    //     setIsDragging(true);
    //     setDragStart({x: e.clientX - position.x, y: e.clientY - position.y});
    //     e.preventDefault();
    // };

    // 处理鼠标移动
    // useEffect(() => {
    //     const handleMouseMove = (e) => {
    //         if (!isDragging) return;
    //         setPosition({x: e.clientX - dragStart.x, y: e.clientY - dragStart.y});
    //     };
    //
    //     if (isDragging) {
    //         document.addEventListener('mousemove', handleMouseMove);
    //     }
    //     return () => document.removeEventListener('mousemove', handleMouseMove);
    // }, [isDragging, position]);

    // 处理鼠标松开
    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // 监听 prompts 变化并更新 localStorage
    useEffect(() => {
        localStorage.setItem(`promptsHistory_${tab.id}`, JSON.stringify(prompts));
    }, [prompts, tab.id]);

    // 添加提示到当前标签页
    const addPrompt = () => {
        if (!newPrompt.trim()) return;
        const newEntry = {name: newName.trim() || `Prompt ${prompts.length + 1}`, prompt: newPrompt};
        // 这里我们直接更新父组件的状态
        setTabs(tabs => tabs.map(t => {
            if (t.id === tab.id) {
                // 注意这里是在末尾添加新的提示
                return {...t, prompts: [...t.prompts, newEntry]};
            }
            return t;
        }));
        setNewPrompt('');
        setNewName('');
    };
    // 删除当前标签页的一个提示
    const deletePrompt = (index) => {
        setTabs(tabs => tabs.map(t => {
            if (t.id === tab.id) {
                return {...t, prompts: t.prompts.filter((_, i) => i !== index)};
            }
            return t;
        }));
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

    //用于维护prompt添加组建的显示和隐藏
    const [showInput, setShowInput] = useState(false);


    return (
        <div style={{
            padding: '2px',
            backgroundColor: '#13152c',
            color: '#FFF',
        }}>
            <div>
                {tab.prompts.map((item, index) => (
                    <div key={index}>
                        <span>{item.name}: </span>
                        <span>{item.prompt}</span>
                        <span className="asdasd">
                        <button className="enter-button" onClick={() => addToTextarea(item.prompt)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 40 27"
                                className="arrow"
                            >
                                <line  stroke="white" y2="14" x2="40" y1="14" x1="1"/>
                                <line
                                    // stroke-width="2"
                                    stroke="white"
                                    y2="1.41537"
                                    x2="10.4324"
                                    y1="14.2433"
                                    x1="1.18869"
                                />
                                <line
                                    // stroke-width="2"
                                    stroke="white"
                                    y2="13.6007"
                                    x2="1.20055"
                                    y1="26.2411"
                                    x1="10.699"
                                />
                                <line
                                    stroke="white"
                                    y2="14.3133"
                                    x2="1.07325"
                                    y1="13.6334"
                                    x1="0.33996"
                                />
                                <line strokeWidth="2" stroke="white" y2="13" x2="39" y1="8" x1="39"/>
                            </svg>
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 89 80"
                                 className="garbage">
                                <path fill="white"
                                      d="M20.5 10.5L...L35.5 79.5L28 67L16 63L12 51.5L0 48L16 25L22.5 17L20.5 10.5Z"/>
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
