import { useState } from "react";
import { Link } from "react-router-dom";

function Boxes() {
  // Пример данных (позже можно грузить с API)
  const [boxes, setBoxes] = useState([
    { id: 1, name: "Бокс 1", returnDate: "2024-07-01", barcodes: ["12345", "67890"], status: "created" },
    { id: 2, name: "Бокс 2", returnDate: "2024-07-05", barcodes: ["11111", "22222", "33333"], status: "issued" },
    { id: 3, name: "Бокс 3", returnDate: "2024-07-10", barcodes: [], status: "returned" },
  ]);

  const [openBoxId, setOpenBoxId] = useState(null);
  const [activeTab, setActiveTab] = useState("created");

  const toggleBox = (id) => {
    setOpenBoxId(openBoxId === id ? null : id);
  };

  const removeBarcode = (boxId, index) => {
    setBoxes(
      boxes.map((box) =>
        box.id === boxId
          ? { ...box, barcodes: box.barcodes.filter((_, i) => i !== index) }
          : box
      )
    );
  };

  // Фильтрация боксов по статусу
  const filteredBoxes = boxes.filter((box) => box.status === activeTab);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Боксы</h1>

      {/* Табы */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        {["created", "issued", "returned"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 15px",
              borderRadius: "5px",
              border: activeTab === tab ? "2px solid #007bff" : "1px solid #ccc",
              background: activeTab === tab ? "#007bff" : "#f9f9f9",
              color: activeTab === tab ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {tab === "created" && "Созданные"}
            {tab === "issued" && "Выданные"}
            {tab === "returned" && "Возвращённые"}
          </button>
        ))}
      </div>

      {/* Список боксов */}
      {filteredBoxes.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredBoxes.map((box) => (
            <li
              key={box.id}
              style={{
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                background: "#f9f9f9",
                cursor: "pointer",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onClick={() => toggleBox(box.id)}
              >
                <span style={{ fontWeight: "bold" }}>{box.name}</span>
                <span style={{ fontStyle: "italic", color: "#555" }}>
                  Дата возврата: {box.returnDate}
                </span>
              </div>

              {openBoxId === box.id && (
                <div style={{ marginTop: "10px" }}>
                  {box.barcodes.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {box.barcodes.map((code, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "1px solid #ddd",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            marginBottom: "5px",
                            background: "#fff",
                          }}
                        >
                          <span>{code}</span>
                          <button
                            type="button"
                            onClick={() => removeBarcode(box.id, index)}
                            style={{
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              padding: "4px 8px",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>Штрих-коды отсутствуют</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", color: "#777", marginTop: "20px" }}>
          Нет боксов в этом статусе.
        </p>
      )}

      <Link to="/Boxes/CreateBox"
        style={{
          display: "block",
          marginTop: "20px",
          textAlign: "center",
          padding: "10px 15px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}>
        Создать бокс
      </Link>
    </div>
  );
}

export default Boxes;
