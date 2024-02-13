import React, {useState, useEffect, useRef, useCallback} from 'react';
import '/src/sideDrawer.css';
import TabManager from "./TabManager.jsx";

function SideDrawer({triggerSelector}) {
    const [isVisible, setIsVisible] = useState(true);
    const triggerRef = useRef(); // 创建一个ref用于触发条
    const [buttonPosition, setButtonPosition] = useState({top: 0, left: 0}); // 存储按钮的位置

    // 初始化标签页，添加"收藏"和"历史"标签，给子组件用
    const [tabs, setTabs] = useState(() => {
        const savedTabs = localStorage.getItem('tabs');
        const parsedTabs = savedTabs ? JSON.parse(savedTabs) : null;
        console.log(savedTabs);
        const defaultTabs = [
            {id: 'favorites', name: '收藏', prompts: [], isFixed: true},
            {id: 'history', name: '历史', prompts: [], isFixed: true}
        ];
        return Array.isArray(parsedTabs) && parsedTabs.length > 0 ? parsedTabs : defaultTabs;
    });

    // 用于维护当前活跃tab
    const [activeTabId, setActiveTabId] = useState(null);

    // 函数用于从子组件更新当前活跃的Tab ID
    const handleActiveTabChange = (newActiveTabId) => {
        setActiveTabId(newActiveTabId);
    };


    useEffect(() => {
        // 监听tabs变化，当tabs变化时，更新localStorage中的数据
        localStorage.setItem('tabs', JSON.stringify(tabs));
    }, [tabs]);

    // 收藏
    const addPromptToFavorites = () => {
        const textArea = document.querySelector('textarea.sc-5db1afd3-45.fnzOi');
        if (textArea) {
            const promptText = textArea.value;
            const favoritesTab = tabs.find(tab => tab.id === 'favorites');
            if (favoritesTab && Array.isArray(favoritesTab.prompts)) {
                const isDuplicate = favoritesTab.prompts.some(prompt => prompt?.prompt === promptText);
                if (!isDuplicate) {
                    const newName = `Prompt ${favoritesTab.prompts.length + 1}`;
                    const newPrompt = {name: newName, prompt: promptText};
                    const updatedTabs = tabs.map(tab => {
                        if (tab.id === 'favorites') {
                            const updatedPrompts = [...tab.prompts, newPrompt];
                            return {...tab, prompts: updatedPrompts};
                        }
                        return tab;
                    });
                    setTabs(updatedTabs);
                    console.log(updatedTabs);
                    // 更新localStorage，确保收藏的数据也被持久化
                    localStorage.setItem('tabs', JSON.stringify(updatedTabs));
                }
            }
        }
    };


    // 添加到当前选中tab
    const addPromptToActiveTab = () => {
        const textArea = document.querySelector('textarea.sc-5db1afd3-45.fnzOi');
        if (textArea) {
            const promptText = textArea.value;
            console.log("标记")
            // 假设你有一个状态来跟踪当前活跃的Tab的ID
            const activeTab = tabs.find(tab => tab.id === activeTabId);
            if (activeTab && Array.isArray(activeTab.prompts)) {
                const isDuplicate = activeTab.prompts.some(prompt => prompt?.prompt === promptText);
                if (!isDuplicate) {
                    const newName = `Prompt ${activeTab.prompts.length + 1}`;
                    const newPrompt = {name: newName, prompt: promptText};
                    setTabs(tabs => tabs.map(tab => {
                        if (tab.id === activeTab.id) {
                            return {...tab, prompts: [...tab.prompts, newPrompt]};
                        }
                        return tab;
                    }));
                }
            }
        }
    };


    //用来保持收藏按钮的状态
    const [isFavorited, setIsFavorited] = useState(false); // 新状态，跟踪是否收藏

    useEffect(() => {
        if (isFavorited) {
            // 当 isFavorited 为 true 时执行的操作
            addPromptToFavorites();

            // 设置延时后再变暗
            const timer = setTimeout(() => {
                setIsFavorited(false);
            }, 300); // 300毫秒后执行

            // 如果组件卸载，清除定时器
            return () => clearTimeout(timer);
        }
    }, [isFavorited]); // 只有当 isFavorited 改变时才会运行

    const handleFavoriteClick = () => {
        setIsFavorited(true);
    };

    // 切换侧边栏的显示状态
    const toggleDrawer = () => {
        setIsVisible(prevState => !prevState);
    };

    const setTriggerPosition = useCallback(() => {
        const triggerElement = document.querySelector(triggerSelector);
        // const triggerElement1 = document.querySelector('.sc-b22b5055-22.ktRRzG');
        if (triggerElement && triggerRef.current) {
            console.log('triggerElement？？？？？');
            const {right, top, height} = triggerElement.getBoundingClientRect();
            triggerRef.current.style.top = `${top}px`;
            triggerRef.current.style.height = `${height}px`;
            triggerRef.current.style.left = `${right + 13}px`; // Position the trigger bar right to the element
            console.log(triggerRef.current.style.left);
        }
        const promptElement1 = document.querySelector('.sc-b22b5055-22.ktRRzG');
        if (promptElement1) {
            const promptElementRect = promptElement1.getBoundingClientRect();
            setButtonPosition({
                top: promptElementRect.top + window.scrollY - 10, // 加上滚动偏移量
                left: promptElementRect.right + 10 // 右侧偏移10px
            });
        }
    }, [triggerSelector]);

    useEffect(() => {
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // 设置触发条的位置
                    setTriggerPosition();
                    // 获取特定组件的位置，并设置按钮的位置
                    const promptElement = document.querySelector('.sc-b22b5055-22.ktRRzG');
                    if (promptElement) {
                        const promptElementRect = promptElement.getBoundingClientRect();
                        setButtonPosition({
                            top: promptElementRect.top + window.scrollY - 10, // 加上滚动偏移量
                            left: promptElementRect.right + 10 // 右侧偏移10px

                        });
                    }
                    observer.disconnect(); // 找到后停止观察
                    break; // 退出循环
                }
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, [setTriggerPosition, triggerSelector]);

    useEffect(() => {
        setTriggerPosition();
        window.addEventListener('resize', setTriggerPosition);
        return () => window.removeEventListener('resize', setTriggerPosition);
    }, [setTriggerPosition]);

    useEffect(() => {
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const triggerElement = document.querySelector(triggerSelector);
                    // console.log(triggerElement);
                    if (triggerElement) {
                        // console.log('trig gerElement');
                        setTriggerPosition();
                        const targetElement = document.querySelector('.sc-b22b5055-0.kWaZHl');
                        if (targetElement) {
                            targetElement.style.zIndex = '1001';
                        }
                        observer.disconnect(); // 找到后停止观察
                        break; // 退出循环
                    }
                }
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, [setTriggerPosition, triggerSelector]);


    // 在组件内部
    const [, setOffset] = useState(0);

    useEffect(() => {
        if (isVisible) {
            // 每次侧边栏变为可见时，增加一点位移
            setOffset(prevOffset => prevOffset + 10); // 每次增加10px
        }
    }, [isVisible]);

    const addToHistory = (promptText) => {
        if (typeof promptText !== 'string' || !promptText.trim()) {
            console.warn('Invalid promptText provided to addToHistory');
            return; // 提早返回，不执行后续操作
        }
        setTabs(tabs => tabs.map(tab => {
            // 检查是否是“历史”标签页
            if (tab.id === 'history') {
                // 检查内容是否已存在
                const isDuplicate = tab.prompts.some(prompt => prompt?.prompt === promptText);
                if (!isDuplicate) {
                    // 如果不是重复的，添加新的提示
                    return {
                        ...tab,
                        prompts: [...tab.prompts, {name: `Prompt ${tab.prompts.length + 1}`, prompt: promptText}]
                    };
                } else {
                    // 如果是重复的，直接返回当前tab，不做任何改变
                    return tab;
                }
            }
            return tab;
        }));
    };


    const handleButtonClick = () => {
        const inputText = document.querySelector('textarea').value; // 假设你的输入框是一个<textarea>
        addToHistory(inputText); // 调用`addToHistory`函数，将输入框内容添加到历史中
    };

    useEffect(() => {
        const button = document.querySelector('.sc-d72450af-1.sc-b22b5055-20.kXFbYD.gRaRZl'); // 使用正确的选择器来选中按钮

        console.log(button);
        if (button) {
            button.addEventListener('click', handleButtonClick);
        }
        return () => {
            if (button) {
                button.removeEventListener('click', handleButtonClick);
            }
        };
    }, []); // 确保依赖项为空数组，这样效果只在组件挂载和卸载时运行

    useEffect(() => {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const button = document.querySelector('.sc-d72450af-1.sc-b22b5055-20.kXFbYD.gRaRZl'); // 使用正确的选择器来选中按钮
                    if (button) {
                        // 设置按钮点击监听器
                        button.addEventListener('click', handleButtonClick);
                        observer.disconnect(); // 找到按钮后不再需要观察
                        break;
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []); // 空依赖项数组，确保只运行一次

    //全局搜索模块
    const [searchResults, setSearchResults] = useState([]);

    return (
        <div className="thing">
            <button className="animated-button" onClick={toggleDrawer}
                    style={{top: `${buttonPosition.top}px`, left: `${buttonPosition.left}px`}}>
                <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
                </svg>
                <span className="text">Prompt Tab</span>
                <span className="circle"/>
                <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
                </svg>
            </button>
            <label className="container"
                   style={{top: `${buttonPosition.top - 5}px`, left: `${buttonPosition.left + 140}px`}}>
                <input type="checkbox" onClick={handleFavoriteClick} readOnly checked={isFavorited}/>
                <svg height="24px" id="Layer_1" version="1.2" viewBox="0 0 24 24" width="24px" xml:space="preserve"
                     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><g><path d="M9.362,9.158c0,0-3.16,0.35-5.268,0.584c-0.19,0.023-0.358,0.15-0.421,0.343s0,0.394,0.14,0.521    c1.566,1.429,3.919,3.569,3.919,3.569c-0.002,0-0.646,3.113-1.074,5.19c-0.036,0.188,0.032,0.387,0.196,0.506    c0.163,0.119,0.373,0.121,0.538,0.028c1.844-1.048,4.606-2.624,4.606-2.624s2.763,1.576,4.604,2.625    c0.168,0.092,0.378,0.09,0.541-0.029c0.164-0.119,0.232-0.318,0.195-0.505c-0.428-2.078-1.071-5.191-1.071-5.191    s2.353-2.14,3.919-3.566c0.14-0.131,0.202-0.332,0.14-0.524s-0.23-0.319-0.42-0.341c-2.108-0.236-5.269-0.586-5.269-0.586    s-1.31-2.898-2.183-4.83c-0.082-0.173-0.254-0.294-0.456-0.294s-0.375,0.122-0.453,0.294C10.671,6.26,9.362,9.158,9.362,9.158z"/></g></g></svg>
            </label>
            <label className="container1"
                   style={{top: `${buttonPosition.top + 10}px`, left: `${buttonPosition.left + 200}px`}}>
                <button onClick={addPromptToActiveTab}>
                    =>
                </button>
            </label>

            <div className={`side-drawer ${isVisible ? 'visible' : ''}`}>
                <TabManager tabs={tabs} setTabs={setTabs} onActiveTabChange={handleActiveTabChange}
                            addPromptToFavorites={addPromptToFavorites} searchResults={searchResults}
                            setSearchResults={setSearchResults}/>
            </div>
        </div>
    );
}

export default SideDrawer;
