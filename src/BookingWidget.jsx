import { useState, useEffect } from "react";
import { Camera, Calendar, Clock, Check, MapPin, User, ChevronLeft, ChevronRight, Settings, Trash2, X, Aperture } from "lucide-react";

const SERVICES = [
  { id: "ritratto", label: "Ritratto" },
  { id: "moda", label: "Moda" },
  { id: "sport", label: "Sport" },
  { id: "still", label: "Still life / Prodotto" },
  { id: "altro", label: "Altro" },
];

const SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];

const MONTHS_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS_IT = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
const DAYS_FULL_IT = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDateLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS_FULL_IT[dt.getDay()]} ${d} ${MONTHS_IT[m - 1]}`;
}

export default function BookingWidget() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [showCustomService, setShowCustomService] = useState(false);
  const [customService, setCustomService] = useState("");
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      setLoadingSlots(true);
      setError("");
      try {
        const res = await fetch(`/api/bookings?date=${selectedDate}`);
        const data = await res.json();
        const times = (data.bookings || []).map((b) => b.time);
        setBookedTimes(times);
      } catch (e) {
        setBookedTimes([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [selectedDate]);

  async function loadAdmin() {
    setLoadingAdmin(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e) {
      setBookings([]);
    } finally {
      setLoadingAdmin(false);
    }
  }

  async function deleteBooking(key) {
    try {
      await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      loadAdmin();
    } catch {}
  }

  async function confirmBooking() {
    if (!name.trim() || !phone.trim()) {
      setError("Inserisci nome e telefono");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service?.label || "",
          name: name.trim(),
          phone: phone.trim(),
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (res.status === 409) {
        setError("Questo orario è stato appena prenotato da qualcun altro, scegline un altro.");
        setSaving(false);
        setStep(2);
        return;
      }

      if (!res.ok) {
        throw new Error("Errore salvataggio");
      }

      setStep(4);
    } catch (e) {
      console.error("Errore conferma prenotazione:", e);
      setError("Non sono riuscito a salvare la prenotazione. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setStep(0);
    setService(null);
    setShowCustomService(false);
    setCustomService("");
    setSelectedDate(null);
    setSelectedTime(null);
    setName("");
    setPhone("");
    setError("");
  }

  function buildCalendarDays() {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }

  const progressSteps = ["Servizio", "Data", "Orario", "Dati"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at top, #1a1230 0%, #0b0812 65%)" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
            <Aperture className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>MatteoPhotographyStudio</h1>
            <p className="text-[11px] text-violet-300/70">Prenota il tuo shooting</p>
          </div>
        </div>

        {step < 4 && (
          <div className="flex items-center gap-1.5 mb-5 px-1">
            {progressSteps.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-violet-500" : "bg-white/10"}`} />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: "#161022" }}>
          <div className="p-5">

            {step === 0 && (
              <div>
                <h2 className="text-white font-medium mb-1 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Camera className="w-4 h-4 text-violet-400" /> Che tipo di shooting?
                </h2>
                <p className="text-xs text-white/40 mb-4">Scegli il servizio che ti interessa</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (s.id === "altro") {
                          setShowCustomService(true);
                          setService(s);
                        } else {
                          setShowCustomService(false);
                          setService(s);
                          setStep(1);
                        }
                      }}
                      className={`text-left px-3.5 py-3 rounded-xl border transition-colors text-sm
                        ${service?.id === s.id ? "border-violet-500/50 bg-violet-500/10 text-white" : "border-white/10 bg-white/[0.03] hover:bg-violet-500/10 hover:border-violet-500/40 text-white/85"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {showCustomService && (
                  <div className="mt-3">
                    <label className="text-[11px] text-white/40 mb-1 block">Descrivi il tipo di shooting</label>
                    <input
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      autoFocus
                      className="w-full bg-white border border-white/10 rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-violet-500/50"
                      placeholder="Es. Book newborn, evento aziendale…"
                    />
                    <button
                      onClick={() => {
                        if (!customService.trim()) return;
                        setService({ id: "altro", label: customService.trim() });
                        setStep(1);
                      }}
                      disabled={!customService.trim()}
                      className="w-full mt-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                      Continua
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <button onClick={() => setStep(0)} className="text-white/40 hover:text-white/70 text-xs mb-3 flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Indietro
                </button>
                <h2 className="text-white font-medium mb-1 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Calendar className="w-4 h-4 text-violet-400" /> Scegli il giorno
                </h2>
                <p className="text-xs text-white/40 mb-4">{service?.label}</p>

                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setViewMonth((m) => { const nm = new Date(m); nm.setMonth(nm.getMonth() - 1); return nm; })}
                    disabled={viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()}
                    className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white/60"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-white/80 font-medium">{MONTHS_IT[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
                  <button
                    onClick={() => setViewMonth((m) => { const nm = new Date(m); nm.setMonth(nm.getMonth() + 1); return nm; })}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAYS_IT.map((d) => (
                    <div key={d} className="text-center text-[10px] text-white/30 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {buildCalendarDays().map((d, i) => {
                    if (!d) return <div key={i} />;
                    const iso = isoDate(d);
                    const isPast = d < today;
                    const isSunday = d.getDay() === 0;
                    const disabled = isPast || isSunday;
                    const isSelected = selectedDate === iso;
                    return (
                      <button
                        key={i}
                        disabled={disabled}
                        onClick={() => { setSelectedDate(iso); setSelectedTime(null); setStep(2); }}
                        className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors
                          ${disabled ? "text-white/15 cursor-not-allowed" : "text-white
