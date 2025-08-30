import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "CREATED", label: "Созданные" },
    { key: "ISSUED", label: "Выданные" },
    { key: "RETURNED", label: "Возвращённые" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: activeTab === tab.key ? "2px solid #007bff" : "1px solid #ccc",
            background: activeTab === tab.key ? "#007bff" : "#f9f9f9",
            color: activeTab === tab.key ? "#fff" : "#000",
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Boxes() {
  const [boxes, setBoxes] = useState([]);
  const [openBoxId, setOpenBoxId] = useState(null);
  const [activeTab, setActiveTab] = useState("CREATED");
  const [loading, setLoading] = useState(false);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [boxBarcode, setBoxBarcode] = useState("");
  const [instrumentInput, setInstrumentInput] = useState("");
  const [scannedInstruments, setScannedInstruments] = useState([]);
  const [checkResult, setCheckResult] = useState({ found: [], notFound: [], error: null });


  const API_URL = process.env.REACT_APP_API_URL;

  const toggleBox = (id) => setOpenBoxId(openBoxId === id ? null : id);

  const fetchBoxes = useCallback(
    async (status) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/boxes/get-by-status?status=${status}&page=0&size=10`);
        if (!res.ok) throw new Error("Ошибка при загрузке биксов");
        const data = await res.json();
        setBoxes(data.content || data);
      } catch (err) {
        console.error(err);
        setBoxes([]);
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  const fetchInstrument = async (barcode) => {
    try {
      const res = await fetch(`${API_URL}/instruments/${barcode}`);
      if (!res.ok) throw new Error("Не удалось получить данные инструмента");
      const data = await res.json();
      return {
        barcode,
        name: data.name || "Инструмент",
        image: data.images?.[0]?.url || null,
      };
    } catch (err) {
      console.error(err);
      return { barcode, name: "Инструмент", image: null };
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchBoxes(tab);
  };

  const handleBoxIssue = async (barcode) => {
    try {
      const res = await fetch(`${API_URL}/boxes/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, boxStatus: "ISSUED", instrumentBarcodes: [] }),
      });
      if (!res.ok) throw new Error("Ошибка при выдаче бикса");
      fetchBoxes(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoxReturn = async () => {
    try {
      const res = await fetch(`${API_URL}/boxes/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: boxBarcode,
          boxStatus: "RETURNED",
          instrumentBarcodes: scannedInstruments.map((i) => i.barcode),
        }),
      });
      if (!res.ok) throw new Error("Ошибка при возврате бикса");
      fetchBoxes(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckInstruments = async () => {
    const box = boxes.find((b) => b.barcode === boxBarcode);

    if (!box) {
      setCheckResult({ found: [], notFound: [], error: "бикс с таким barcode не найден." });
      return;
    }

    const scannedBarcodes = scannedInstruments.map((i) => i.barcode);

    const found = scannedInstruments.filter((i) => i.status === "found");

    const notFound = (box.instruments || [])
      .filter((i) => !scannedBarcodes.includes(i.barcode))
      .map((i) => ({
        barcode: i.barcode,
        name: i.name,
        image: i.images?.[0]?.url || null,
      }));

    setCheckResult({ found, notFound, error: null });
  };




  useEffect(() => {
    fetchBoxes("CREATED");
  }, [fetchBoxes]);


  const handleAddInstrument = async (rawBarcode) => {
    const barcode = rawBarcode.trim().toUpperCase();

    if (!barcode) return;

    const box = boxes.find((b) => b.barcode === boxBarcode);

    if (!box) {
      setCheckResult({ error: "бикс с таким barcode не найден." });
      return;
    }

    const alreadyScanned = scannedInstruments.some((inst) => inst.barcode === barcode);
    if (alreadyScanned) {
      setCheckResult({ error: `Инструмент ${barcode} уже добавлен.` });
      return;
    }

    const existsInBox = box.instruments?.some((inst) => inst.barcode === barcode);

    if (existsInBox) {
      const instrument = await fetchInstrument(barcode);
      setScannedInstruments((prev) => [...prev, { ...instrument, status: "found" }]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/instruments/${barcode}`);
      if (res.ok) {
        const data = await res.json();
        setScannedInstruments((prev) => [
          ...prev,
          {
            barcode,
            name: data.name || "Инструмент",
            image: data.images?.[0]?.url || null,
            status: "extra",
          },
        ]);
      } else {
        setScannedInstruments((prev) => [
          ...prev,
          { barcode, name: "Неизвестный инструмент", image: null, status: "lost" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setScannedInstruments((prev) => [
        ...prev,
        { barcode, name: "Ошибка загрузки", image: null, status: "lost" },
      ]);
    }
  };




  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Биксы</h1>

      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

      {loading ? (
        <p style={{ textAlign: "center" }}>Загрузка...</p>
      ) : boxes.length ? (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {boxes.map((box) => (
            <li
              key={box.id}
              style={{ width: "100%", padding: "12px", background: "#f9f9f9", borderRadius: "6px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => toggleBox(box.id)}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{box.name}</div>
                  <div style={{ fontSize: "12px", color: "#555" }}>Доктор: {box.doctorName}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontStyle: "italic", color: "#555" }}>Дата возврата: {box.return_by}</span>
                  {activeTab === "CREATED" && (
                    <button
                      onClick={() => setShowBoxModal(true)}
                      style={{ padding: "6px 12px", background: "#30ca94ff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Выдать
                    </button>
                  )}
                  {activeTab === "ISSUED" && (
                    <button
                      onClick={() => setShowBoxModal(true)}
                      style={{ padding: "6px 12px", background: "#ff9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Вернуть
                    </button>
                  )}
                </div>
              </div>

              {openBoxId === box.id && box.instruments?.length > 0 && (
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {box.instruments.map((i) => (
                    <div key={i.id} style={{ width: "30%", background: "#fff", borderRadius: "5px", fontSize: "12px", padding: "6px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {i.images?.[0]?.url && <img src={i.images[0].url} alt={i.name} style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px", marginBottom: "4px" }} />}
                      <div style={{ textAlign: "center" }}>
                        <b>{i.name}</b> <br /> <span style={{ fontSize: "11px", color: "#555" }}>({i.barcode})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", color: "#777", marginTop: "20px" }}>Нет биксов в этом статусе.</p>
      )}

      <Link
        to="/Boxes/CreateBox"
        style={{
          display: "block",
          marginTop: "20px",
          textAlign: "center",
          padding: "8px 12px",
          background: "#007bff",
          color: "white",
          borderRadius: "4px",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        Создать бикс
      </Link>

      {showBoxModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "6px", minWidth: "300px" }}>
            <h3>{activeTab === "CREATED" ? "Введите barcode бикса" : "Возврат бикса"}</h3>

            <input
              type="text"
              value={boxBarcode}
              onChange={(e) => setBoxBarcode(e.target.value)}
              placeholder="Box barcode"
              style={{ width: "100%", padding: "6px", marginTop: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />

            {activeTab === "ISSUED" && (
              <>
                <input
                  type="text"
                  value={instrumentInput}
                  onChange={(e) => setInstrumentInput(e.target.value)}
                  placeholder="Сканируйте инструмент"
                  style={{ width: "100%", padding: "6px", marginTop: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && instrumentInput.trim()) {
                      await handleAddInstrument(instrumentInput);
                      setInstrumentInput("");
                    }
                  }}

                />

                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {scannedInstruments.map((inst) => {
                    let color = "inherit";
                    if (inst.status === "found") color = "green";
                    if (inst.status === "extra") color = "orange";
                    if (inst.status === "lost") color = "red";

                    return (
                      <div
                        key={inst.barcode}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          borderBottom: "1px solid #eee",
                          padding: "2px 0",
                          color,
                        }}
                      >
                        {inst.image && (
                          <img
                            src={inst.image}
                            alt={inst.name}
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        <span style={{ fontSize: "13px" }}>
                          <b>{inst.name}</b> <span>({inst.barcode})</span>{" "}
                          {inst.status === "found" && <span>(В биксе)</span>}
                          {inst.status === "extra" && <span>(Не было в биксе)</span>}
                          {inst.status === "lost" && <span>(Не найден)</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>


                <button
                  onClick={handleCheckInstruments}
                  style={{ marginTop: "10px", background: "#2196f3", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer" }}
                >
                  Проверить наличие
                </button>

                {checkResult && (
                  <div style={{ marginTop: "12px", fontSize: "13px" }}>
                    {checkResult.error && <div style={{ color: "red" }}>{checkResult.error}</div>}

                    {checkResult.found?.map((i) => (
                      <div key={`found-${i.barcode}`} style={{ color: "green", display: "flex", alignItems: "center", gap: "4px", padding: "2px 0" }}>
                        {i.image && <img src={i.image} alt={i.name} style={{ width: "20px", height: "20px", objectFit: "cover", borderRadius: "3px" }} />}
                        {i.name} ({i.barcode}) — На месте
                      </div>
                    ))}

                    {checkResult.notFound?.map((i) => (
                      <div key={`lost-${i.barcode}`} style={{ color: "red", display: "flex", alignItems: "center", gap: "4px", padding: "2px 0" }}>
                        {i.image && <img src={i.image} alt={i.name} style={{ width: "20px", height: "20px", objectFit: "cover", borderRadius: "3px" }} />}
                        {i.name} ({i.barcode}) — Потерян
                      </div>
                    ))}
                  </div>
                )}

              </>
            )}

            <div style={{ marginTop: "15px", display: "flex", gap: "8px" }}>
              {activeTab === "CREATED" ? (
                <button
                  onClick={() => {
                    handleBoxIssue(boxBarcode);
                    setShowBoxModal(false);
                    setBoxBarcode("");
                  }}
                  style={{ background: "#30ca94ff", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer" }}
                >
                  Выдать
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleBoxReturn();
                    setShowBoxModal(false);
                    setBoxBarcode("");
                    setScannedInstruments([]);
                    setCheckResult(null);
                  }}
                  disabled={!checkResult}
                  style={{
                    background: checkResult ? "#30ca94ff" : "#aaa",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: checkResult ? "pointer" : "not-allowed",
                  }}
                >
                  Подтвердить возврат
                </button>
              )}
              <button
                onClick={() => setShowBoxModal(false)}
                style={{ background: "#ccc", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer" }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Boxes;