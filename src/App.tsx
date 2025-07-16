import React, { useState } from "react";

type SyllabusItem = {
  id: string;
  title: string;
  completed: boolean;
  children: SyllabusItem[];
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const loadSyllabus = (): SyllabusItem[] => {
  const data = localStorage.getItem("syllabus");
  return data ? JSON.parse(data) : [];
};

const saveSyllabus = (syllabus: SyllabusItem[]) => {
  localStorage.setItem("syllabus", JSON.stringify(syllabus));
};

const calculateProgress = (items: SyllabusItem[]): number => {
  let total = 0, done = 0;
  const walk = (list: SyllabusItem[]) => {
    list.forEach(item => {
      total++;
      if (item.completed) done++;
      if (item.children.length) walk(item.children);
    });
  };
  walk(items);
  return total === 0 ? 0 : Math.round((done / total) * 100);
};

const SyllabusTracker: React.FC = () => {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(loadSyllabus());
  const [newTitle, setNewTitle] = useState("");

  React.useEffect(() => {
    saveSyllabus(syllabus);
  }, [syllabus]);

  const addItem = (parentId?: string) => {
    const newItem: SyllabusItem = {
      id: generateId(),
      title: newTitle.trim() || "Untitled",
      completed: false,
      children: []
    };
    if (!parentId) {
      setSyllabus([...syllabus, newItem]);
    } else {
      setSyllabus(updateItem(syllabus, parentId, (item) => {
        item.children.push(newItem);
      }));
    }
    setNewTitle("");
  };

  const updateItem = (
    items: SyllabusItem[],
    id: string,
    cb: (item: SyllabusItem) => void
  ): SyllabusItem[] => {
    return items.map(item => {
      if (item.id === id) {
        cb(item);
      }
      if (item.children.length) {
        item.children = updateItem(item.children, id, cb);
      }
      return { ...item };
    });
  };

  const toggleComplete = (id: string) => {
    setSyllabus(updateItem(syllabus, id, (item) => {
      item.completed = !item.completed;
    }));
  };

  const deleteItem = (id: string) => {
    const remove = (items: SyllabusItem[]): SyllabusItem[] =>
      items.filter(item => item.id !== id)
           .map(item => ({
             ...item,
             children: remove(item.children)
           }));
    setSyllabus(remove(syllabus));
  };

  const renderItems = (items: SyllabusItem[], level = 0) =>
    items.map(item => (
      <div key={item.id} className="syllabus-item" style={{marginLeft: level * 20}}>
        <label>
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => toggleComplete(item.id)}
          />
          <span className="syllabus-title">{item.title}</span>
        </label>
        <button className="add-nested-btn" onClick={() => addItem(item.id)}>Add Subitem</button>
        <button className="delete-btn" onClick={() => deleteItem(item.id)}>Delete</button>
        {item.children.length > 0 && (
          <div className="syllabus-children">
            {renderItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));

  return (
    <div className="container">
      <div className="top-bar">Syllabus Tracker</div>
      <div className="progress-bar">
        <span>Progress: {calculateProgress(syllabus)}%</span>
        <div className="progress-bg">
          <div
            className="progress-fill"
            style={{ width: `${calculateProgress(syllabus)}%` }}
          />
        </div>
      </div>
      <div className="add-item-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add new syllabus item..."
        />
        <button className="add-btn" onClick={() => addItem()}>
          Add
        </button>
      </div>
      <div className="syllabus-list">
        {renderItems(syllabus)}
      </div>
      <div className="bottom-bar">Your custom syllabus, always with you!</div>
    </div>
  );
};

export default SyllabusTracker;
