import React, {useState, useEffect} from 'react';
import './TextAreaManager.css'; // 确保创建并引入相应的CSS文件

function TextAreaItemsEditor() {
    const [items, setItems] = useState([]);
    const [isEditorVisible, setIsEditorVisible] = useState(false); // 添加一个新的状态
    const textArea = document.querySelector('textarea.sc-5db1afd3-45.fnzOi');
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragging, setDragging] = useState(false); // 跟踪是否正在拖拽


    // 让他们可以拖动
    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        setDragging(true); // 开始拖拽
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData('text/plain', ''); // 需要设置拖拽数据以启用拖拽
        e.currentTarget.classList.add('dragging');
    };
    const handleDragOver = (e, index) => {
        e.preventDefault(); // 防止默认处理（默认不允许放下）
        e.dataTransfer.dropEffect = "move";
    };
    const handleDragEnd = (e) => {
        setDragging(false); // 结束拖拽
        e.currentTarget.classList.remove('dragging');
    };
    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        // 确保有一个有效的被拖拽项索引
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

        const newItems = [...items];
        // 移除被拖拽的item
        const [item] = newItems.splice(draggedItemIndex, 1);
        // 计算插入位置
        const newIndex = draggedItemIndex < targetIndex ? targetIndex - 1 : targetIndex;
        // 在目标位置插入item
        newItems.splice(newIndex, 0, item);
        setItems(newItems);
        updateTextArea(newItems); // 更新textarea内容
        // 重置拖拽索引
        setDraggedItemIndex(null);
    };


    // 初始化内容和添加监听器
    useEffect(() => {
        const observer = new MutationObserver((mutations, obs) => {
            const textArea = document.querySelector('textarea.sc-5db1afd3-45.fnzOi');
            if (textArea) {
                setItems(splitContent(textArea.value));
                // 处理textarea输入事件
                const handleInput = () => {
                    setItems(splitContent(textArea.value));
                };
                textArea.addEventListener('input', handleInput);
                console.log("开始监听input");
                obs.disconnect();
                // 清理函数
                return () => {
                    textArea.removeEventListener('input', handleInput);
                };
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
        // 分割文本内容的函数
        const splitContent = (content) => {
            const pattern = /{(.*?)}|([^,]+)/g;
            let match;
            let initialItems = [];

            while ((match = pattern.exec(content)) !== null) {
                initialItems.push(match[1] ? `{${match[1]}}` : match[0].trim());
            }

            return initialItems;
        };
        // 清理函数
        return () => observer.disconnect();
    }, []);



    // 更新textarea内容的函数
    const updateTextArea = (newItems) => {
        const textArea = document.querySelector('textarea.sc-5db1afd3-45.fnzOi');
        if (textArea) {
            textArea.value = newItems.join(', ');
        }
    };

    const handleItemUpdate = (index, newItem) => {
        const newItems = [...items];
        newItems[index] = newItem;
        setItems(newItems);
        updateTextArea(newItems);
    };

    const handleItemDelete = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        updateTextArea(newItems);
    };

    const handleAddBraces = (index, openingBrace, closingBrace) => {
        const newItems = [...items];
        newItems[index] = openingBrace + newItems[index] + closingBrace;
        setItems(newItems);
        updateTextArea(newItems);
    };

    const handleRemoveBraces = (index) => {
        let newItem = items[index];
        if (newItem.startsWith('{') && newItem.endsWith('}')) {
            newItem = newItem.slice(1, -1); // 移除最外层的{}
        } else if (newItem.startsWith('[') && newItem.endsWith(']')) {
            newItem = newItem.slice(1, -1); // 移除最外层的[]
        }
        const newItems = [...items];
        newItems[index] = newItem;
        setItems(newItems);
        updateTextArea(newItems);
    };


    return (
        <>
            <button
                className="toggle-editor-btn"
                onClick={() => setIsEditorVisible(!isEditorVisible)}
            >
                {isEditorVisible ? "<" : ">"}
            </button>

            <div className={`tags-container ${isEditorVisible ? 'visible' : 'hidden'}`}>
                {items.map((item, index) => (
                    <div key={index} className="tag-item-container" draggable="true"
                         onDragStart={(e) => handleDragStart(e, index)}
                         onDragOver={(e) => handleDragOver(e, index)}
                         onDragEnd={handleDragEnd}
                         onDrop={(e) => handleDrop(e, index)}>
                        <div className="tag-buttons">
                            <button className="edit-tag" onClick={() => handleAddBraces(index, '{', '}')}>丄</button>
                            <button className="edit-tag" onClick={() => handleAddBraces(index, '[', ']')}>丅</button>
                            <button className="edit-tag" onClick={() => handleRemoveBraces(index)}>一</button>
                        </div>
                        <div className="tag-item">
            <span
                contentEditable
                className="tag-content"
                onBlur={(e) => handleItemUpdate(index, e.target.textContent)}
                dangerouslySetInnerHTML={{__html: item}}
            />
                            <button className="delete-tag" onClick={() => handleItemDelete(index)}>x</button>
                        </div>
                    </div>
                ))}

            </div>
        </>
    );
}

export default TextAreaItemsEditor;
