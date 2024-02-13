import React, {useEffect, useState} from 'react';
import PromptHistory from './PromptHistory';
import '/src/TabManager.css';

function TabManager({tabs, setTabs, searchResults, setSearchResults, onActiveTabChange}) {
    // 现在tabs由父组件维护
    const [newTabName, setNewTabName] = useState('');
    const [activeTabId, setActiveTabId] = useState(() => {
        const savedActiveTabId = localStorage.getItem('activeTabId');
        return savedActiveTabId ? JSON.parse(savedActiveTabId) : 1;
    });
    const [draggingTabId, setDraggingTabId] = useState(null);
    const [, setPosition] = useState({x: 0, y: 0}); // 初始位置
    const [dragging, setDragging] = useState(false); // 是否正在拖动
    const [startPos,] = useState({x: 0, y: 0}); // 开始拖动的位置

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
            setPosition({x: dx, y: dy});
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


    // 添加新标签页, 并设置为当前标签页, 并清空输入框, 并设置新标签页的id, 并设置新标签页的名字, 并设置新标签页的提示, 并设置新标签页的id
    const addTab = () => {
        // 筛选出所有数字类型的 id，忽略非数字的 id
        const numericIds = tabs.map(tab => Number(tab.id)).filter(id => !isNaN(id));
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const newTabId = maxId + 1;
        const newTab = {
            id: newTabId,
            name: newTabName || `Tab ${tabs.length + 1}`,
            prompts: []
        };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setNewTabName('');
        setActiveTabId(newTabId);
        onActiveTabChange(newTabId);
        setShowAddTab(false); // 添加完标签后隐藏输入组件
        setNewTabName(''); // 重置输入框
    };

    // 删除标签页的逻辑需要排除固定标签
    const deleteTab = (tabId) => {
        const tabToDelete = tabs.find(tab => tab.id === tabId);
        if (tabToDelete && !tabToDelete.isFixed) {
            const updatedTabs = tabs.filter(tab => tab.id !== tabId);
            setTabs(updatedTabs);
            if (activeTabId === tabId) {
                setActiveTabId(updatedTabs.length > 0 ? updatedTabs[0].id : null);
                onActiveTabChange(updatedTabs.length > 0 ? updatedTabs[0].id : null);
            }
            localStorage.setItem('tabs', JSON.stringify(updatedTabs));
            if (activeTabId === tabId) {
                localStorage.setItem('activeTabId', JSON.stringify(updatedTabs.length > 0 ? updatedTabs[0].id : null));
            }
            localStorage.removeItem(`promptsHistory_${tabId}`);
        }
    };

    const [, setButtonPosition] = useState({top: 0, left: 0});

    useEffect(() => {
        const updateButtonPosition = () => {
            const promptElement = document.querySelector('.sc-b22b5055-22.ktRRzG');
            if (promptElement) {
                const rect = promptElement.getBoundingClientRect();
                setButtonPosition({
                    top: rect.top + window.scrollY - 10,
                    left: rect.right + 10
                });
            }
        };

        // 创建一个观察者实例并传入回调函数
        const observer = new MutationObserver(() => {
            // 每当DOM变化时，尝试更新按钮位置
            updateButtonPosition();
        });

        // 配置观察者选项：子树变化和子节点的增减
        const config = {childList: true, subtree: true};

        // 选择目标节点
        const targetNode = document.body; // 或者更具体的节点，如果你知道更准确的位置

        // 开始观察目标节点
        observer.observe(targetNode, config);

        // 确保在组件加载时也尝试一次更新位置
        updateButtonPosition();

        // 清理函数：停止观察
        return () => observer.disconnect();
    }, []);

    // 处理Tab切换，更新activeTabId
    const handleTabChange = (id) => {
        setActiveTabId(id);
        onActiveTabChange(id);
    };

    const handleDragStart = (id) => () => {
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

    //add组件隐藏状态控制
    const [showAddTab, setShowAddTab] = useState(false); // 控制输入框的显示和隐藏

    // 当 showAddTab 状态改变时，我们可以做一些额外的处理
    useEffect(() => {
        // 如果 showAddTab 为 true，则让输入框获得焦点
        if (showAddTab) {
            const inputElement = document.querySelector('.input1');
            inputElement && inputElement.focus();
        }
    }, [showAddTab]);

    //搜索模块
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedResults, setExpandedResults] = useState(new Map());

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = new Map();
        tabs.forEach((tab) => {
            tab.prompts.forEach((prompt) => {
                if (prompt.name.includes(searchTerm) || prompt.prompt.includes(searchTerm)) {
                    const key = `${prompt.name}:${prompt.prompt}`;
                    if (!results.has(key)) {
                        results.set(key, prompt);
                    }
                }
            });
        });

        setSearchResults(Array.from(results.values()));
    }, [searchTerm, tabs, setSearchResults]);

    // // 函数用于将内容添加到<textarea>
    // const addToTextarea = (promptText) => {
    //     // 选择页面上的特定<textarea>元素
    //     const textarea = document.querySelector('textarea.fnzOi');
    //     if (textarea) {
    //         const existingContent = textarea.value;
    //         textarea.value = existingContent + promptText;
    //     }
    // };

    // 展开/折叠搜索结果的处理函数
    const toggleExpandResult = (key) => {
        setExpandedResults((prev) => {
            const newExpanded = new Map(prev);
            newExpanded.set(key, !newExpanded.get(key)); // 切换当前key的展开状态
            return newExpanded;
        });
    };

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return `${text.substring(0, maxLength)}...`;
    }

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

    const handlePromptsUpdate = (updatedPrompts) => {
        // Update the tabs state with the updated prompts for the active tab
        const updatedTabs = tabs.map(tab => {
            if (tab.id === activeTabId) {
                return {...tab, prompts: updatedPrompts};
            }
            return tab;
        });
        console.log("修改");
        setTabs(updatedTabs); // Update the state
        localStorage.setItem('tabs', JSON.stringify(updatedTabs)); // Persist the changes
    };


    return (
        <div className="tab-manager-container">
            <div className="search-results">
                {searchResults.map((result, index) => {
                    const key = `${result.name}:${index}`;
                    const isExpanded = expandedResults.get(key);
                    return (
                        <div key={key} className="search-result-item">
                            <h4>{result.name}</h4>
                            <p>{isExpanded ? result.prompt : truncateText(result.prompt, 100)}</p>
                            <button className="more-button"
                                    onClick={() => toggleExpandResult(key)}>{isExpanded ? 'less' : 'more'}</button>
                            <button className="enter-button" onClick={() => addToTextarea(result.prompt)}>
                                +
                            </button>
                            <button className="enter-button" onClick={() => replaceTextArea(result.prompt)}>
                                use
                            </button>

                        </div>
                    );
                })}
            </div>
            <div className="search-container">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                />

            </div>
            <div className="tabs-bar">
                {tabs.map(tab => (
                    <div key={tab.id} className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                         draggable={!tab.isFixed}
                         onDragStart={tab.isFixed ? null : handleDragStart(tab.id)}
                         onDragOver={handleDragOver}
                         onDrop={handleDrop(tab.id)}
                         onClick={() => handleTabChange(tab.id)}>
                        <span>
                        {tab.name}</span>
                        {!tab.isFixed && (
                            <button className="bin-button" onClick={() => deleteTab(tab.id)}>
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
                        )}
                    </div>
                ))}
                <button onClick={() => {
                    setShowAddTab(true)
                }} className="add-tab-button">+
                </button>
                {showAddTab && (
                    <div className={`input-group ${showAddTab ? 'show' : ''}`}>
                        <input
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                            required=""
                            type="text"
                            name="text"
                            autoComplete="off"
                            className="input1"
                        />
                        <label className="user-label">Tab</label>
                        <button onClick={addTab} className="button">Add Tab</button>
                    </div>
                )}

            </div>
            <div className="tab-content">
                {tabs.filter(tab => tab.id === activeTabId).map(tab => (
                    <PromptHistory key={tab.id} tab={tab} setTabs={setTabs} onPromptsUpdate={handlePromptsUpdate}/>
                ))}
            </div>
        </div>
    );
}

export default TabManager;


