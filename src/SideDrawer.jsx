import React, {useState, useEffect, useRef, useCallback} from 'react';
import '/src/sideDrawer.css';
import TabManager from "./TabManager.jsx";
import TextAreaItemsEditor from "./TextAreaItemsEditor.jsx";
import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';


function SideDrawer({triggerSelector}) {
    const [isVisible, setIsVisible] = useState(true);
    const triggerRef = useRef(); // 创建一个ref用于触发条
    const [buttonPosition, setButtonPosition] = useState({top: 0, left: 0, right: 0,width:1000}); // 存储按钮的位置
    const [triggerExists, setTriggerExists] = useState(false);
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
            // console.log('triggerElement？？？？？');
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

    // useEffect(() => {
    //     const observer = new MutationObserver(mutationsList => {
    //         for (const mutation of mutationsList) {
    //             if (mutation.type === 'childList') {
    //                 // 设置触发条的位置
    //                 setTriggerPosition();
    //                 // 获取特定组件的位置，并设置按钮的位置
    //                 const promptElement = document.querySelector('.sc-b22b5055-22.ktRRzG');
    //                 if (promptElement) {
    //                     const promptElementRect = promptElement.getBoundingClientRect();
    //                     setButtonPosition({
    //                         top: promptElementRect.top + window.scrollY - 10, // 加上滚动偏移量
    //                         left: promptElementRect.right + 10 // 右侧偏移10px
    //
    //                     });
    //                 }
    //                 observer.disconnect(); // 找到后停止观察
    //                 break; // 退出循环
    //             }
    //         }
    //     });
    //     observer.observe(document.body, {childList: true, subtree: true});
    //     return () => observer.disconnect();
    // }, [setTriggerPosition]);
    function mountComponentAtTargetDiv() {
        const observer = new MutationObserver((mutations, obs) => {
            const targetDiv = document.querySelector('.sc-b22b5055-10.jwqfiN');
            if (targetDiv) {
                const mountPoint = document.createElement('div');
                targetDiv.parentNode.insertBefore(mountPoint, targetDiv.nextSibling);

                // 使用 createRoot 替代 ReactDOM.render
                const root = createRoot(mountPoint);
                root.render(<TextAreaItemsEditor />);
                console.log("mountComponentAtTargetDiv");
                obs.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    useEffect(() => {

        mountComponentAtTargetDiv();

    }, []);


    useEffect(() => {
        if (!triggerExists) return;
        const targetElement = document.querySelector(triggerSelector);
        const targetElement1 = document.querySelector('.sc-56746855-0.PWOhS');
        if (!targetElement||!targetElement1) return;

        const updatePosition = () => {
            const rect = targetElement.getBoundingClientRect();
            const rect1 = targetElement1.getBoundingClientRect();
            // 更新 side-drawer 的位置
            setButtonPosition({top: rect.top, left: rect.right, right: rect1.left});
        };

        // 监听窗口大小变化和目标元素的大小变化
        const resizeObserver = new ResizeObserver(entries => {
            updatePosition();
        });
        resizeObserver.observe(targetElement);

        // 监听DOM变化，适用于元素位置变化的场景
        const mutationObserver = new MutationObserver(mutations => {
            updatePosition();
        });
        mutationObserver.observe(document.body, {childList: true, subtree: true});

        // 初始更新一次位置
        updatePosition();

        // 清理函数
        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [triggerExists,triggerSelector]); // 依赖项中包括 triggerSelector，确保目标元素选择器变化时重新设置监听


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
                        const targetElement1 = document.querySelector('.sc-b22b5055-10.jwqfiN');

                        if (targetElement) {
                            targetElement.style.zIndex = '1001';
                            targetElement1.style.visibility = 'hidden';
                            targetElement1.style.maxHeight = '0';
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
        console.log(tabs);
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
        // 创建一个MutationObserver实例来监听DOM变更
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                // 检查是否有新的子节点被添加
                if (mutation.addedNodes.length) {
                    const button = document.querySelector('.sc-d72450af-1.sc-b22b5055-20.kXFbYD.gRaRZl');
                    if (button) {
                        button.addEventListener('click', handleButtonClick);
                        // 成功添加事件监听器后，断开observer
                        observer.disconnect();
                        break;
                    }
                }
            }
        });
        // 配置observer监视的内容：子节点的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        // 组件卸载时的清理函数
        return () => {
            // 断开observer
            observer.disconnect();
            // 移除按钮的事件监听器，防止内存泄露
            const button = document.querySelector('.sc-d72450af-1.sc-b22b5055-20.kXFbYD.gRaRZl');
            if (button) {
                button.removeEventListener('click', handleButtonClick);
            }
        };

    }, []); // 确保依赖项为空数组，这样效果只在组件挂载和卸载时运行

    // useEffect(() => {
    //     const observer = new MutationObserver((mutationsList, observer) => {
    //         for (const mutation of mutationsList) {
    //             if (mutation.type === 'childList') {
    //                 const button = document.querySelector('.sc-d72450af-1.sc-b22b5055-20.kXFbYD.gRaRZl'); // 使用正确的选择器来选中按钮
    //                 if (button) {
    //                     // 设置按钮点击监听器
    //                     button.addEventListener('click', handleButtonClick);
    //                     observer.disconnect(); // 找到按钮后不再需要观察
    //                     break;
    //                 }
    //             }
    //         }
    //     });
    //
    //     observer.observe(document.body, {
    //         childList: true,
    //         subtree: true
    //     });
    //
    //     return () => observer.disconnect();
    // }, []); // 空依赖项数组，确保只运行一次

    //全局搜索模块
    const [searchResults, setSearchResults] = useState([]);


    const exportTabs = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tabs));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tabs_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importTabs = (event) => {
        if (event.target.files.length === 0) {
            console.error("No file selected");
            return;
        }

        const file = event.target.files[0];
        if (!(file instanceof Blob)) {
            console.error("Selected file is not a Blob or File");
            return;
        }

        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            const content = e.target.result;
            try {
                const parsedTabs = JSON.parse(content);
                setTabs(parsedTabs);
            } catch (error) {
                console.error("Error parsing the file:", error);
            }
        };
    };



// 监听 DOM 变化，查找 triggerSelector 对应的元素
    useEffect(() => {
        const observer = new MutationObserver((mutationsList, observer) => {
            if (document.querySelector(triggerSelector)) {
                setTriggerExists(true); // 找到了元素，更新状态
                observer.disconnect(); // 停止观察
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 如果页面一开始就存在元素，直接设置 triggerExists 为 true
        if (document.querySelector(triggerSelector)) {
            setTriggerExists(true);
        }

        return () => observer.disconnect();
    }, [triggerSelector]);


    return (
        <div className="thing">
            <div className={`side-drawer ${isVisible ? 'visible' : ''}`} style={{
                top: 0,
                left: buttonPosition.left,
                right: buttonPosition.right,
                width: buttonPosition.right - buttonPosition.left,
                minWidth:buttonPosition.right - buttonPosition.left
            }}>
                <TabManager tabs={tabs} setTabs={setTabs} onActiveTabChange={handleActiveTabChange}
                            addPromptToFavorites={addPromptToFavorites} searchResults={searchResults}
                            setSearchResults={setSearchResults}/>
            </div>
            <button className="animated-button" onClick={toggleDrawer}
            >
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
            >
                <input type="checkbox" onClick={handleFavoriteClick} readOnly checked={isFavorited}/>
                <svg height="24px" id="Layer_1" version="1.2" viewBox="0 0 24 24" width="24px" xml:space="preserve"
                     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><g><path d="M9.362,9.158c0,0-3.16,0.35-5.268,0.584c-0.19,0.023-0.358,0.15-0.421,0.343s0,0.394,0.14,0.521    c1.566,1.429,3.919,3.569,3.919,3.569c-0.002,0-0.646,3.113-1.074,5.19c-0.036,0.188,0.032,0.387,0.196,0.506    c0.163,0.119,0.373,0.121,0.538,0.028c1.844-1.048,4.606-2.624,4.606-2.624s2.763,1.576,4.604,2.625    c0.168,0.092,0.378,0.09,0.541-0.029c0.164-0.119,0.232-0.318,0.195-0.505c-0.428-2.078-1.071-5.191-1.071-5.191    s2.353-2.14,3.919-3.566c0.14-0.131,0.202-0.332,0.14-0.524s-0.23-0.319-0.42-0.341c-2.108-0.236-5.269-0.586-5.269-0.586    s-1.31-2.898-2.183-4.83c-0.082-0.173-0.254-0.294-0.456-0.294s-0.375,0.122-0.453,0.294C10.671,6.26,9.362,9.158,9.362,9.158z"/></g></g></svg>
            </label>
            <label className="container1"
            >
                <button className="container1" onClick={addPromptToActiveTab}>
                    Add to Current->
                </button>
            </label>

            <label className="container2">
                <button className="portbutton" onClick={exportTabs}>Export</button>
                <input type="file" id="fileInput" style={{display: 'none'}} onChange={importTabs}/>
                <button className="portbutton" style={{left: "5%"}}
                        onClick={() => document.getElementById('fileInput').click()}>Import
                </button>
            </label>
            {/*<TextAreaItemsEditor/>*/}
        </div>
    );
}

export default SideDrawer;
