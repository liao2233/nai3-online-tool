import {useEffect, useState} from 'react';

function PromptHistory({tab, setTabs}) {

    const [prompts, setPrompts] = useState(() => {
        const saved = localStorage.getItem(`promptsHistory_${tab.id}`);
        const parsed = saved ? JSON.parse(saved) : [];

        // if (Array.isArray(parsed)) {
        //     return parsed;
        // } else {
        //     console.error('Expected an array from localStorage but got:', parsed);
        //     return [];
        // }

        return Array.isArray(parsed) ? parsed : [];
    });

    const [newPrompt, setNewPrompt] = useState('');
    const [newName, setNewName] = useState('');
    const [position, setPosition] = useState({x: 20, y: 20});
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setDragStart({x: e.clientX - position.x, y: e.clientY - position.y});
        e.preventDefault();
    };

    // 处理鼠标移动
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({x: e.clientX - dragStart.x, y: e.clientY - dragStart.y});
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
        }
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [isDragging, position]);

    // 处理鼠标松开
    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);
    // useEffect(() => {
    //     // Update localStorage when prompts change
    //     localStorage.setItem('promptsHistory', JSON.stringify(prompts));
    // }, [prompts]);

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
                return { ...t, prompts: [...t.prompts, newEntry] };
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
                return { ...t, prompts: t.prompts.filter((_, i) => i !== index) };
            }
            return t;
        }));
    };

    // 函数用于将内容添加到<textarea>
    const addToTextarea = (promptText) => {
        // 选择页面上的特定<textarea>元素
        const textarea = document.querySelector('textarea.fnzOi');
        if (textarea) {
            // 获取<textarea>中现有的内容
            const existingContent = textarea.value;
            // 将新的prompt内容追加到现有内容后面
            // 请确保适当地添加分隔符，如换行符'\n'
            // 更新<textarea>的内容
            textarea.value = existingContent + promptText;
        }
    };

    return (
        <div style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            padding: '20px',
            backgroundColor: '#333',
            color: '#FFF',
        }}>
            <div>
                {tab.prompts.map((item, index) => (
                    <div key={index}>
                        <span>{item.name}: </span>
                        <span>{item.prompt}</span>
                        <button onClick={() => addToTextarea(item.prompt)}>use</button>
                        <button onClick={() => deletePrompt(index)}>Delete</button>
                    </div>
                ))}
            </div>
            <input value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                    required="" type="text" name="text" autoComplete="off"
                   className="input1"/>
            <label className="user-label">Prompt</label>
            <input value={newPrompt}
                   onChange={(e) => setNewPrompt(e.target.value)}
                    required="" type="text" name="text" autoComplete="off"
                   className="input1"/>
            <label className="user-label">Content</label>

            <button onClick={addPrompt}>Add Prompt</button>
            <div style={{marginTop: '20px'}}>
                {prompts.map((item, index) => (
                    <div key={index} style={{marginBottom: '10px'}}>
                        <span style={{marginRight: '10px'}}>{item.name}:</span>
                        <span style={{marginRight: '10px'}}>{item.prompt}</span>

                        <button onClick={() => deletePrompt(index)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>


        // <div className="space-y-4">
        //     {tab.prompts.map((item, index) => (
        //         <div
        //             key={index}
        //             className="w-72 bg-white rounded-b-lg border-t-8 border-green-400 px-4 py-5 flex flex-col justify-around shadow-md"
    //         >
    //             <p className="text-lg font-bold font-sans">{item.name}</p>
    //             <div className="py-3">
    //                 <p className="text-gray-400 text-sm">
    //                     {item.prompt}
    //                 </p>
    //             </div>
    //             <div className="flex justify-between items-center">
    //                 <button
    //                     onClick={() => addToTextarea(item.prompt)}
    //                     className="bg-slate-200 px-2 rounded-xl hover:bg-slate-400 transition-colors ease-in-out"
    //                 >
    //                     Use
    //                 </button>
    //                 <button
    //                     onClick={() => deletePrompt(index)}
    //                     className="bin-button"
    //                 >
    //                     {/* SVG bin icon */}
    //                     <svg
    //                         // ... SVG path for bin icon
    //                         className="garbage"
    //                     />
    //                 </button>
    //             </div>
    //         </div>
    //     ))}
    //     {/* ...其他组件内容 */}
    //          <input
    //             style={{marginRight: '10px'}}
    //             value={newName}
    //             onChange={(e) => setNewName(e.target.value)}
    //             placeholder="Enter prompt name"
    //         />
    //         <input
    //             style={{marginRight: '10px'}}
    //             value={newPrompt}
    //             onChange={(e) => setNewPrompt(e.target.value)}
    //             placeholder="Enter prompt text"
    //         />
    //         <button onClick={addPrompt}>Add Prompt</button>
    //         <div style={{marginTop: '20px'}}>
    //             {prompts.map((item, index) => (
    //                 <div key={index} style={{marginBottom: '10px'}}>
    //                     <span style={{marginRight: '10px'}}>{item.name}:</span>
    //                     <span style={{marginRight: '10px'}}>{item.prompt}</span>
    //
    //                     <button onClick={() => deletePrompt(index)}>Delete</button>
    //                 </div>
    //             ))}
    //         </div>
    // </div>
    );
}

export default PromptHistory;
