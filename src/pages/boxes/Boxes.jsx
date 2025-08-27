import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Boxes() {
  const [boxes, setBoxes] = useState([]);
  const [openBoxId, setOpenBoxId] = useState(null);
  const [activeTab, setActiveTab] = useState("CREATED");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const toggleBox = (id) => {
    setOpenBoxId(openBoxId === id ? null : id);
  };

  useEffect(() => {
    const fetchBoxes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/boxes/get-by-status?status=${activeTab}&page=0&size=10`
        );
        if (!res.ok) throw new Error("Ошибка при загрузке боксов");
        const data = await res.json();
        const rawBoxes = data.content || data;
        setBoxes(rawBoxes);
      } catch (err) {
        console.error(err);
        setBoxes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, [activeTab, API_URL]);

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Боксы</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        {["CREATED", "ISSUED", "RETURNED"].map((tab) => (
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
            {tab === "CREATED" && "Созданные"}
            {tab === "ISSUED" && "Выданные"}
            {tab === "RETURNED" && "Возвращённые"}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ textAlign: "center" }}>Загрузка...</p>
      ) : boxes.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
          {boxes.map((box) => (
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
                <div>
                  <div style={{ fontWeight: "bold" }}>{box.name}</div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    Доктор: {box.doctorName}
                  </div>
                </div>
                <span style={{ fontStyle: "italic", color: "#555" }}>
                  Дата возврата: {box.return_by}
                </span>
              </div>
              {openBoxId === box.id && (
                <div style={{ marginTop: "10px" }}>
                  {box.instruments?.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      {box.instruments.map((instrument, index) => (
                        <div
                          key={instrument.id}
                          style={{
                            flex: "0 1 calc(33.333% - 10px)",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "10px",
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div><b>{instrument.name}</b> ({instrument.barcode})</div>
                            <div style={{ fontSize: "12px", color: "#555" }}>
                              Серийный: {instrument.serialNumber} | Страна: {instrument.country}
                            </div>
                            {instrument.images?.[0]?.url && (
                              <img
                                src={instrument.images[0].url}
                                alt={instrument.images[0].originalName}
                                style={{
                                  width: "100%",
                                  maxHeight: "120px",
                                  objectFit: "cover",
                                  marginTop: "5px",
                                  borderRadius: "5px",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>Инструментов нет</p>
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
      <Link
        to="/Boxes/CreateBox"
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
        }}
      >
        Создать бокс
      </Link>
    </div>
  );
}

export default Boxes;
