import React, {useEffect, useState} from 'react';
import PromptHistory from './PromptHistory';
import '/TabManager.css';

function TabManager() {
    // 尝试从localStorage读取tabs状态，如果没有，则使用默认值初始化
    const [tabs, setTabs] = useState(() => {
        const savedTabs = localStorage.getItem('tabs');
        return savedTabs ? JSON.parse(savedTabs) : [{ id: 1, name: 'Tab 1', prompts: [] }];
    });


    const [newTabName, setNewTabName] = useState('');
    const [activeTabId, setActiveTabId] = useState(() => {
        const savedActiveTabId = localStorage.getItem('activeTabId');
        return savedActiveTabId ? JSON.parse(savedActiveTabId) : 1;
    });
    const [draggingTabId, setDraggingTabId] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 }); // 初始位置
    const [dragging, setDragging] = useState(false); // 是否正在拖动
    const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // 开始拖动的位置

    // 每当tabs或activeTabId变化时，更新localStorage
    useEffect(() => {
        localStorage.setItem('tabs', JSON.stringify(tabs));
        localStorage.setItem('activeTabId', JSON.stringify(activeTabId));
    }, [tabs, activeTabId]);

    // 处理鼠标的逻辑
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!dragging) return;
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;
            setPosition({ x: dx, y: dy });
        };

        const handleMouseUp = () => {
            if (dragging) {
                setDragging(false);
            }
        };

        if (dragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, startPos]);

    const handleMouseDown = (e) => {
        setDragging(true);
        setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    // 添加新标签页, 并设置为当前标签页, 并清空输入框, 并设置新标签页的id, 并设置新标签页的名字, 并设置新标签页的提示, 并设置新标签页的id
    const addTab = () => {
        const newTabId = Math.max(...tabs.map(t => t.id), 0) + 1;
        const newTab = {
            id: newTabId,
            name: newTabName || `Tab ${tabs.length + 1}`,
            prompts: []
        };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setNewTabName('');
        setActiveTabId(newTabId);
    };

    // 删除标签页系列操作，包括过滤掉要删除的Tab，如果删除的是当前激活的Tab，激活新的Tab，更新localStorage
    const deleteTab = (tabId) => {
        // 过滤掉要删除的Tab
        const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(updatedTabs);

        // 如果删除的是当前激活的Tab，激活新的Tab
        if (activeTabId === tabId) {
            setActiveTabId(updatedTabs.length > 0 ? updatedTabs[0].id : null);
        }

        // 更新localStorage
        localStorage.setItem('tabs', JSON.stringify(updatedTabs));
        if (activeTabId === tabId) {
            localStorage.setItem('activeTabId', JSON.stringify(updatedTabs.length > 0 ? updatedTabs[0].id : null));
        }
        // 删除与该Tab相关的任何额外数据，例如该Tab的提示
        localStorage.removeItem(`promptsHistory_${tabId}`);
    };

    // 添加新的提示到当前激活的Tab
    const addPromptFromTextArea = () => {
        // 获取<textarea>元素
        const textArea = document.querySelector('textarea.sc-5db1afd3-45.fnzOi');
        if (textArea) {
            const promptText = textArea.value;

            // 确保不添加重复的内容
            const activeTab = tabs.find(tab => tab.id === activeTabId);
            const isDuplicate = activeTab.prompts.some(prompt => prompt.prompt === promptText);
            if (!isDuplicate) {
                // 将新内容添加到当前激活的Tab中
                const newName = `Prompt ${activeTab.prompts.length + 1}`;
                const newPrompt = { name: newName, prompt: promptText };
                setTabs(tabs => tabs.map(tab => {
                    if (tab.id === activeTabId) {
                        return { ...tab, prompts: [...tab.prompts, newPrompt] };
                    }
                    return tab;
                }));
            }
        }
    };

    // 处理Tab切换，更新activeTabId
    const handleTabChange = (id) => {
        setActiveTabId(id);
    };

    const handleDragStart = (id) => (e) => {
        setDraggingTabId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // 防止默认处理阻碍拖放
    };

    const handleDrop = (targetId) => (e) => {
        e.preventDefault();
        const draggedTabIndex = tabs.findIndex(tab => tab.id === draggingTabId);
        const targetTabIndex = tabs.findIndex(tab => tab.id === targetId);

        if (draggedTabIndex !== -1 && targetTabIndex !== -1) {
            const newTabs = Array.from(tabs);
            const [removed] = newTabs.splice(draggedTabIndex, 1);
            newTabs.splice(targetTabIndex, 0, removed);
            setTabs(newTabs);
        }
        setDraggingTabId(null);
    };

    return (
        // <div className="tab-manager-container" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        //     {/* 外框容器 */}
        //     <div className="tabs-bar">
        //         <button onMouseDown={handleMouseDown}>Move</button>
        //         <button onClick={addPromptFromTextArea}>收藏</button>
        //         {tabs.map(tab => (
        //             <div>
        //                 <button
        //                     key={tab.id}
        //                     draggable
        //                     onDragStart={handleDragStart(tab.id)}
        //                     onDragOver={handleDragOver}
        //                     onDrop={handleDrop(tab.id)}
        //                     className={draggingTabId === tab.id ? 'dragging' : ''}
        //                     onClick={() => handleTabChange(tab.id)}
        //                 >
        //                     {tab.name}
        //                 </button>
        //                 <button onClick={() => deleteTab(tab.id)} className="delete-tab">X</button>
        //             </div>
        //         ))}
        //         <input
        //             value={newTabName}
        //             onChange={(e) => setNewTabName(e.target.value)}
        //             placeholder="New tab name"
        //         />
        //         <button onClick={addTab}>Add Tab</button>
        //     </div>
        //     <div className="tab-content">
        //         {tabs.filter(tab => tab.id === activeTabId).map(tab => (
        //             <PromptHistory key={tab.id} tab={tab} setTabs={setTabs}/>
        //         ))}
        //     </div>
        // </div>
        <div className="tab-manager-container">
            <div className="tabs-bar">
                {/* 移动和收藏按钮可能需要视觉样式调整 */}
                {/*<button onMouseDown={handleMouseDown}>Move</button>*/}
                <button onClick={addPromptFromTextArea}>收藏</button>
                {tabs.map(tab => (
                    <div key={tab.id} className="tab" draggable onDragStart={handleDragStart(tab.id)}
                         onDragOver={handleDragOver} onDrop={handleDrop(tab.id)}
                         onClick={() => handleTabChange(tab.id)}>
                        {tab.name}
                        {/*<button onClick={() => deleteTab(tab.id)} className="delete-tab">X</button>*/}
                        <button className="bin-button" onClick={() => deleteTab(tab.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 39 7" className="bin-top">
                                <line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"></line>
                                <line strokeWidth="3" stroke="white" y2="1.5" x2="26.0357" y1="1.5" x1="12"></line>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 33 39"
                                 className="bin-bottom">
                                <mask id="path-1-inside-1_8_19" fill="white">
                                    <path
                                        d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                                </mask>
                                <path mask="url(#path-1-inside-1_8_19)" fill="white"
                                      d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"></path>
                                <path strokeWidth="4" stroke="white" d="M12 6L12 29"></path>
                                <path strokeWidth="4" stroke="white" d="M21 6V29"></path>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 89 80" className="garbage">
                                <path fill="white"
                                      d="M20.5 10.5L...L35.5 79.5L28 67L16 63L12 51.5L0 48L16 25L22.5 17L20.5 10.5Z"></path>
                            </svg>
                        </button>
                    </div>
                ))}
                {/*<input value={newTabName} onChange={(e) => setNewTabName(e.target.value)} placeholder="New tab name"*/}
                {/*       className="input"/>*/}
                <div class="input-group">
                <input value={newTabName} onChange={(e) => setNewTabName(e.target.value)}  required="" type="text" name="text" autoComplete="off" className="input1"/>
                <label className="user-label">Tab</label></div>
                <button onClick={addTab} className="button">Add Tab</button>
            </div>
            <div className="tab-content">
                {tabs.filter(tab => tab.id === activeTabId).map(tab => (
                    <PromptHistory key={tab.id} tab={tab} setTabs={setTabs}/>
                ))}
            </div>
        </div>
    );
}

export default TabManager;


