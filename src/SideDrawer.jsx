import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SideDrawer.css';
import TabManager from "./TabManager.jsx";
function SideDrawer({ triggerSelector }) {
    const [isVisible, setIsVisible] = useState(false);
    const sideDrawerRef = useRef();
    const triggerRef = useRef(); // 创建一个ref用于触发条
    const [isHovering, setIsHovering] = useState(false); // 新增状态来跟踪鼠标是否在侧边栏上

    // 切换侧边栏的显示状态
    const toggleDrawer = () => {
        setIsVisible(prevState => !prevState);
    };

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
        setIsHovering(true); // 鼠标进入时设置悬停状态
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false); // 鼠标离开时清除悬停状态
        // 如果鼠标不在侧边栏上，才隐藏侧边栏
        if (!isHovering) {
            setIsVisible(false);
        }
    }, [isHovering]);

    const setTriggerPosition = useCallback(() => {
        const triggerElement = document.querySelector(triggerSelector);
        if (triggerElement && triggerRef.current) {
            // console.log('triggerElement？？？？？');
            const { right, top, height } = triggerElement.getBoundingClientRect();
            triggerRef.current.style.top = `${top}px`;
            triggerRef.current.style.height = `${height}px`;
            triggerRef.current.style.left = `${right+13}px`; // Position the trigger bar right to the element
            console.log(triggerRef.current.style.left);
        }
    }, [triggerSelector]);

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

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [setTriggerPosition, triggerSelector]);


    // 在组件内部
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (isVisible) {
            // 每次侧边栏变为可见时，增加一点位移
            setOffset(prevOffset => prevOffset + 10); // 每次增加10px
        }
    }, [isVisible]);

    return (
        // <>
        //     <div ref={triggerRef} className="trigger-bar"
        //          onMouseEnter={() => setIsVisible(true)}
        //          onMouseLeave={() => setIsVisible(false)}>
        //         {/* Trigger bar content (if any) */}
        //     </div>
        //     <div ref={sideDrawerRef} className={`side-drawer ${isVisible ? 'visible' : ''}`}
        //          onMouseEnter={() => setIsVisible(true)} // 鼠标进入侧边栏时设置悬停状态
        //          onMouseLeave={() => setIsVisible(false)}>
        //        <TabManager/>
        //     </div>
        // </>
        <div className="thing">
            <button className="animated-button" onClick={toggleDrawer}>
                <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                </svg>
                <span className="text">Prompt Tab</span>
                <span className="circle"></span>
                <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                </svg>
            </button>
            <div className={`side-drawer ${isVisible ? 'visible' : ''}`}>
                <TabManager/>
            </div>
        </div>
    );
}

export default SideDrawer;
