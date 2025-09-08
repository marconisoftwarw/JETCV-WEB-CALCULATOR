import { useMemo, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Plus,
  Download,
  RotateCcw,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Settings,
  PlusCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import "./modern-design.css";

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Tipi di dato
interface ServizioRow {
  id: string;
  servizio: string;
  costo1000: number;
  costo10000: number;
  costo100000: number;
  [key: string]: string | number; // Per scenari custom
}

interface ScenarioCustom {
  id: string;
  nome: string;
  utenti: number;
  colore: string;
  ordinamento: number;
}

// Nuova interfaccia per la tabella media
interface MediaRow {
  id: string;
  tipo: string;
  maxPerCustomer: number;
  duration: string;
  weightGB: number;
}

const COLORI_SCENARI = [
  "#2563eb", // Blu
  "#059669", // Verde
  "#d97706", // Arancione
  "#dc2626", // Rosso
  "#7c3aed", // Viola
  "#0891b2", // Cyan
  "#ea580c", // Orange scuro
  "#be123c", // Rose
  "#059669", // Emerald
  "#7c2d12", // Orange scuro
];

// Dati servizi ricorrenti
const SERVIZI_RICORRENTI: ServizioRow[] = [
  {
    id: crypto.randomUUID(),
    servizio: "Firebase Hosting",
    costo1000: 0,
    costo10000: 0,
    costo100000: 2,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Supabase",
    costo1000: 30,
    costo10000: 30,
    costo100000: 30,
  },
  {
    id: crypto.randomUUID(),
    servizio: "AWS EC2",
    costo1000: 15,
    costo10000: 15,
    costo100000: 30,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Crossmint",
    costo1000: 15,
    costo10000: 15,
    costo100000: 15,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Veriff(KYC)",
    costo1000: 60,
    costo10000: 60,
    costo100000: 60,
  },
  {
    id: crypto.randomUUID(),
    servizio: "FlutterFlow",
    costo1000: 50,
    costo10000: 50,
    costo100000: 50,
  },
  {
    id: crypto.randomUUID(),
    servizio: "App Store",
    costo1000: 8.25, // 99€/anno = 8.25€/mese
    costo10000: 8.25,
    costo100000: 8.25,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Play Store",
    costo1000: 2.08, // 25€ una tantum ammortizzato su 12 mesi
    costo10000: 2.08,
    costo100000: 2.08,
  },
];

// Scenari predefiniti
const SCENARI_DEFAULT: ScenarioCustom[] = [
  {
    id: "scenario-1k",
    nome: "1K Utenti",
    utenti: 1000,
    colore: "#2563eb",
    ordinamento: 1,
  },
  {
    id: "scenario-10k",
    nome: "10K Utenti",
    utenti: 10000,
    colore: "#059669",
    ordinamento: 2,
  },
  {
    id: "scenario-100k",
    nome: "100K Utenti",
    utenti: 100000,
    colore: "#d97706",
    ordinamento: 3,
  },
];

export default function DashboardServizi() {
  const [serviziRicorrenti, setServiziRicorrenti] =
    useState<ServizioRow[]>(SERVIZI_RICORRENTI);
  const [scenariCustom, setScenariCustom] =
    useState<ScenarioCustom[]>(SCENARI_DEFAULT);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [showScenarioForm, setShowScenarioForm] = useState(false);
  const [nuovoScenario, setNuovoScenario] = useState({
    nome: "",
    utenti: 0,
    colore: COLORI_SCENARI[3],
  });

  // State per parametri di Crossmint
  const [percentualeUtentiAttivi, setPercentualeUtentiAttivi] = useState(5); // Percentuale degli utenti attivi
  const [numeroUpdateMint, setNumeroUpdateMint] = useState(2);

  // State per parametri di Veriff(KYC)
  const [percentualeCertificatori, setPercentualeCertificatori] = useState(10); // Percentuale degli utenti certificatori

  // State per la tabella media
  const [mediaTable, setMediaTable] = useState<MediaRow[]>([
    {
      id: "foto",
      tipo: "Foto",
      maxPerCustomer: 3,
      duration: "-",
      weightGB: 0.002, // 2 MB = 0.002 GB
    },
    {
      id: "audio",
      tipo: "Audio",
      maxPerCustomer: 1,
      duration: "45 sec",
      weightGB: 0.00244,
    },
    {
      id: "video",
      tipo: "Video",
      maxPerCustomer: 1,
      duration: "30 sec",
      weightGB: 0.00244,
    },
  ]);

  // Calcola costo storage per tipo media
  const calcolaCostoStorage = (
    weightGB: number,
    maxPerCustomer: number,
    utenti: number,
  ) => {
    const storagePerUtente = weightGB * maxPerCustomer;
    const storageTotale = storagePerUtente * utenti;
    const costoStorage = storageTotale * 0.021; // $0.021 per GB
    return costoStorage;
  };

  // Funzione per calcolare il costo di Veriff(KYC)
  const calcolaCostoVeriff = useCallback(
    (numeroUtenti: number) => {
      // Formula: (49 + (numero totale di utenti certificatori * 0.80)) / 12
      const utentiCertificatori =
        (numeroUtenti * percentualeCertificatori) / 100;
      return 49 + (utentiCertificatori * 0.8) / 12;
    },
    [percentualeCertificatori],
  );

  // Funzione per calcolare il costo di Crossmint
  const calcolaCostoCrossmint = useCallback(
    (numeroUtenti: number) => {
      // Formula: ((numeroutenti*0.10) /12)+ (utentiAttivi% * numeroUtenti * 0.05 * numeroUpdateMint)
      const costoFisso = (numeroUtenti * 0.1) / 12;
      const utentiAttiviEffettivi =
        (numeroUtenti * percentualeUtentiAttivi) / 100;
      const costoVariabile = utentiAttiviEffettivi * 0.05 * numeroUpdateMint;
      return costoFisso + costoVariabile;
    },
    [percentualeUtentiAttivi, numeroUpdateMint],
  );

  // Funzione per calcolare il costo di Supabase
  const calcolaCostoSupabase = useCallback(
    (numeroUtenti: number) => {
      // Formula: 30 + (0.20 * utenti attivi al mese)
      const utentiAttiviEffettivi =
        (numeroUtenti * percentualeUtentiAttivi) / 100;
      return 30 + 0.2 * utentiAttiviEffettivi;
    },
    [percentualeUtentiAttivi],
  );

  // Scenari ordinati
  const scenariOrdinati = useMemo(
    () => scenariCustom.sort((a, b) => a.ordinamento - b.ordinamento),
    [scenariCustom],
  );

  // Calcoli totali per tutti gli scenari
  const totaliScenari = useMemo(() => {
    const totali: { [key: string]: { mensile: number; annuale: number } } = {};

    scenariOrdinati.forEach((scenario) => {
      const colonnaKey = `costo${scenario.utenti}` as keyof ServizioRow;
      let totale = 0;

      // Se è uno scenario predefinito, usa le colonne esistenti
      if (scenario.utenti === 1000) {
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = s.costo1000 || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(1000);
          }
          // Applica la formula speciale per Veriff(KYC)
          if (s.servizio === "Veriff(KYC)") {
            costo = calcolaCostoVeriff(1000);
          }
          // Applica la formula speciale per Supabase
          if (s.servizio === "Supabase") {
            costo = calcolaCostoSupabase(1000);
          }
          // App Store e Play Store hanno costi fissi
          if (s.servizio === "App Store") {
            costo = 8.25; // 99€/anno = 8.25€/mese
          }
          if (s.servizio === "Play Store") {
            costo = 2.08; // 25€ una tantum ammortizzato
          }
          return sum + costo;
        }, 0);
      } else if (scenario.utenti === 10000) {
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = s.costo10000 || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(10000);
          }
          // Applica la formula speciale per Veriff(KYC)
          if (s.servizio === "Veriff(KYC)") {
            costo = calcolaCostoVeriff(10000);
          }
          // Applica la formula speciale per Supabase
          if (s.servizio === "Supabase") {
            costo = calcolaCostoSupabase(10000);
          }
          // App Store e Play Store hanno costi fissi
          if (s.servizio === "App Store") {
            costo = 8.25; // 99€/anno = 8.25€/mese
          }
          if (s.servizio === "Play Store") {
            costo = 2.08; // 25€ una tantum ammortizzato
          }
          return sum + costo;
        }, 0);
      } else if (scenario.utenti === 100000) {
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = s.costo100000 || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(100000);
          }
          // Applica la formula speciale per Veriff(KYC)")
          if (s.servizio === "Veriff(KYC)") {
            costo = calcolaCostoVeriff(100000);
          }
          // Applica la formula speciale per Supabase
          if (s.servizio === "Supabase") {
            costo = calcolaCostoSupabase(100000);
          }
          // App Store e Play Store hanno costi fissi
          if (s.servizio === "App Store") {
            costo = 8.25; // 99€/anno = 8.25€/mese
          }
          if (s.servizio === "Play Store") {
            costo = 2.08; // 25€ una tantum ammortizzato
          }
          return sum + costo;
        }, 0);
      } else {
        // Per scenari custom, usa la colonna dinamica
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = Number(s[colonnaKey]) || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(scenario.utenti);
          }
          // Applica la formula speciale per Veriff(KYC)")
          if (s.servizio === "Veriff(KYC)") {
            costo = calcolaCostoVeriff(scenario.utenti);
          }
          // Applica la formula speciale per Supabase
          if (s.servizio === "Supabase") {
            costo = calcolaCostoSupabase(scenario.utenti);
          }
          // App Store e Play Store hanno costi fissi
          if (s.servizio === "App Store") {
            costo = 8.25; // 99€/anno = 8.25€/mese
          }
          if (s.servizio === "Play Store") {
            costo = 2.08; // 25€ una tantum ammortizzato
          }
          return sum + costo;
        }, 0);
      }

      // Aggiungi i costi di storage media per questo scenario
      const costoStorageMedia = mediaTable.reduce((sum, media) => {
        return (
          sum +
          calcolaCostoStorage(
            media.weightGB,
            media.maxPerCustomer,
            scenario.utenti,
          )
        );
      }, 0);

      totali[scenario.id] = {
        mensile: totale + costoStorageMedia,
        annuale: (totale + costoStorageMedia) * 12,
      };
    });

    return totali;
  }, [
    serviziRicorrenti,
    scenariOrdinati,
    calcolaCostoCrossmint,
    calcolaCostoVeriff,
    calcolaCostoSupabase,
    mediaTable,
  ]);

  // Configurazione grafici Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 16,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: { parsed: { y: number } }) {
            return `€${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "Inter",
          },
          color: "#6b7280",
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
          drawBorder: false,
        },
        ticks: {
          callback: function (value: string | number) {
            return "€" + Number(value).toLocaleString();
          },
          font: {
            size: 11,
            family: "Inter",
          },
          color: "#6b7280",
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
  };

  // Genera dati per grafico di uno scenario specifico
  const getChartDataForScenario = (scenario: ScenarioCustom) => {
    const colonnaKey = `costo${scenario.utenti}` as keyof ServizioRow;

    // Dati servizi esistenti
    const serviziData = serviziRicorrenti.map((s) => {
      let costo = 0;
      if (scenario.utenti === 1000) {
        costo = s.costo1000 || 0;
      } else if (scenario.utenti === 10000) {
        costo = s.costo10000 || 0;
      } else if (scenario.utenti === 100000) {
        costo = s.costo100000 || 0;
      } else {
        costo = Number(s[colonnaKey]) || 0;
      }

      // Applica le formule speciali
      if (s.servizio === "Crossmint") {
        costo = calcolaCostoCrossmint(scenario.utenti);
      } else if (s.servizio === "Veriff(KYC)") {
        costo = calcolaCostoVeriff(scenario.utenti);
      } else if (s.servizio === "Supabase") {
        costo = calcolaCostoSupabase(scenario.utenti);
      } else if (s.servizio === "App Store") {
        costo = 8.25; // 99€/anno = 8.25€/mese
      } else if (s.servizio === "Play Store") {
        costo = 2.08; // 25€ una tantum ammortizzato
      }

      return costo;
    });

    // Dati storage media
    const mediaData = mediaTable.map((media) =>
      calcolaCostoStorage(
        media.weightGB,
        media.maxPerCustomer,
        scenario.utenti,
      ),
    );

    // Combina i dati
    const allData = [...serviziData, ...mediaData];
    const allLabels = [
      ...serviziRicorrenti.map((s) =>
        s.servizio.length > 8 ? s.servizio.substring(0, 8) + "..." : s.servizio,
      ),
      ...mediaTable.map((media) => `${media.tipo} Storage`),
    ];

    return {
      labels: allLabels,
      datasets: [
        {
          data: allData,
          backgroundColor: scenario.colore,
          hoverBackgroundColor: scenario.colore + "dd",
          borderRadius: 4,
        },
      ],
    };
  };

  const addServizio = () => {
    const nuovoServizio: ServizioRow = {
      id: crypto.randomUUID(),
      servizio: "Nuovo servizio",
      costo1000: 0,
      costo10000: 0,
      costo100000: 0,
    };

    // Aggiungi colonne per scenari custom esistenti
    scenariCustom.forEach((scenario) => {
      if (![1000, 10000, 100000].includes(scenario.utenti)) {
        nuovoServizio[`costo${scenario.utenti}`] = 0;
      }
    });

    setServiziRicorrenti((prev) => [...prev, nuovoServizio]);
  };

  const removeServizio = (id: string) => {
    setServiziRicorrenti((prev) => prev.filter((r) => r.id !== id));
  };

  const addScenarioCustom = () => {
    if (!nuovoScenario.nome || nuovoScenario.utenti <= 0) {
      alert("Inserisci un nome valido e un numero di utenti maggiore di 0");
      return;
    }

    const nuovoId = `scenario-${Date.now()}`;
    const colonnaKey = `costo${nuovoScenario.utenti}`;

    // Aggiungi il nuovo scenario
    const scenario: ScenarioCustom = {
      id: nuovoId,
      nome: nuovoScenario.nome,
      utenti: nuovoScenario.utenti,
      colore: nuovoScenario.colore,
      ordinamento: scenariCustom.length + 1,
    };

    setScenariCustom((prev) => [...prev, scenario]);

    // Aggiungi la nuova colonna a tutti i servizi esistenti
    setServiziRicorrenti((prev) =>
      prev.map((servizio) => ({
        ...servizio,
        [colonnaKey]: 0,
      })),
    );
    setNuovoScenario({
      nome: "",
      utenti: 0,
      colore: COLORI_SCENARI[scenariCustom.length % COLORI_SCENARI.length],
    });
    setShowScenarioForm(false);
  };

  const removeScenario = (scenarioId: string) => {
    const scenario = scenariCustom.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Non permettere di rimuovere scenari predefiniti
    if ([1000, 10000, 100000].includes(scenario.utenti)) {
      alert("Non puoi rimuovere gli scenari predefiniti");
      return;
    }

    const colonnaKey = `costo${scenario.utenti}`;

    // Rimuovi scenario
    setScenariCustom((prev) => prev.filter((s) => s.id !== scenarioId));

    // Rimuovi colonna da tutti i servizi
    setServiziRicorrenti((prev) =>
      prev.map((servizio) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [colonnaKey]: _, ...resto } = servizio;
        return resto as ServizioRow;
      }),
    );
  };

  const reset = () => {
    setServiziRicorrenti(
      SERVIZI_RICORRENTI.map((r) => ({ ...r, id: crypto.randomUUID() })),
    );
    setScenariCustom(SCENARI_DEFAULT);
    setShowScenarioForm(false);
  };

  const exportCSV = () => {
    const data = serviziRicorrenti.map((servizio) => {
      const row: { [key: string]: string | number } = {
        Servizio: servizio.servizio,
      };
      scenariOrdinati.forEach((scenario) => {
        if (scenario.utenti === 1000) row[scenario.nome] = servizio.costo1000;
        else if (scenario.utenti === 10000)
          row[scenario.nome] = servizio.costo10000;
        else if (scenario.utenti === 100000)
          row[scenario.nome] = servizio.costo100000;
        else row[scenario.nome] = servizio[`costo${scenario.utenti}`] || 0;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Costi Servizi");
    XLSX.writeFile(wb, "costi-servizi-custom.csv");
  };

  // Handlers per editing
  const startEditing = (cellId: string, currentValue: string | number) => {
    setEditingCell(cellId);
    setTempValue(String(currentValue));
  };

  const saveEdit = (id: string, field: string, value: string) => {
    if (field === "servizio") {
      setServiziRicorrenti((prev) =>
        prev.map((r) => (r.id === id ? { ...r, servizio: value } : r)),
      );
    } else {
      const numValue = Number(value) || 0;
      setServiziRicorrenti((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: numValue } : r)),
      );
    }
    setEditingCell(null);
    setTempValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempValue("");
  };

  // Handlers per editing tabella media
  const startEditingMedia = (cellId: string, currentValue: string | number) => {
    setEditingCell(cellId);
    setTempValue(String(currentValue));
  };

  const saveEditMedia = (id: string, field: string, value: string) => {
    if (field === "tipo" || field === "duration") {
      setMediaTable((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      );
    } else {
      const numValue = Number(value) || 0;
      setMediaTable((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: numValue } : r)),
      );
    }
    setEditingCell(null);
    setTempValue("");
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div>
              <h1 className="header-title">JECT Cost Calculator</h1>
              <p className="header-subtitle">
                Analizza costi con scenari personalizzabili
              </p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowScenarioForm(true)}
                className="btn btn-primary"
                title="Aggiungi scenario personalizzato"
              >
                <PlusCircle className="btn-icon" />
                Nuovo Scenario
              </button>
              <button onClick={addServizio} className="btn btn-secondary">
                <Plus className="btn-icon" />
                Servizio
              </button>
              <button onClick={reset} className="btn btn-secondary">
                <RotateCcw className="btn-icon" />
                Reset
              </button>
              <button onClick={exportCSV} className="btn btn-secondary">
                <Download className="btn-icon" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Form Nuovo Scenario */}
        {showScenarioForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Crea Scenario Personalizzato</h3>

              <div className="form-group">
                <label className="form-label">Nome Scenario</label>
                <input
                  type="text"
                  value={nuovoScenario.nome}
                  onChange={(e) =>
                    setNuovoScenario((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="es. 5K Utenti, Startup, Enterprise..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Numero Utenti</label>
                <input
                  type="number"
                  value={nuovoScenario.utenti || ""}
                  onChange={(e) =>
                    setNuovoScenario((prev) => ({
                      ...prev,
                      utenti: Number(e.target.value),
                    }))
                  }
                  placeholder="5000"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Colore</label>
                <div className="color-picker">
                  {COLORI_SCENARI.map((colore, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setNuovoScenario((prev) => ({ ...prev, colore }))
                      }
                      className={`color-option ${nuovoScenario.colore === colore ? "selected" : ""}`}
                      style={{ backgroundColor: colore }}
                      title={`Colore ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setShowScenarioForm(false)}
                  className="btn btn-secondary"
                >
                  Annulla
                </button>
                <button onClick={addScenarioCustom} className="btn btn-primary">
                  Crea Scenario
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content">
          {/* Stats Cards Dinamiche */}
          <div className="stats-grid">
            {scenariOrdinati.map((scenario, index) => {
              const costoPerUtente =
                (totaliScenari[scenario.id]?.mensile || 0) / scenario.utenti;
              const arpuTarget = 50; // ARPU fisso a €50
              const efficiencyRatio = arpuTarget / costoPerUtente;

              return (
                <div key={scenario.id} className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-card-header">
                      <div
                        className="stat-icon"
                        style={{
                          backgroundColor: scenario.colore + "20",
                          color: scenario.colore,
                        }}
                      >
                        {index === 0 ? (
                          <Users size={24} />
                        ) : index === 1 ? (
                          <TrendingUp size={24} />
                        ) : (
                          <DollarSign size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="stat-title">{scenario.nome}</h3>
                        <div className="stat-value">
                          €
                          {totaliScenari[
                            scenario.id
                          ]?.mensile.toLocaleString() || "0"}
                          /MESE
                        </div>
                      </div>
                    </div>

                    {/* Nuova sezione per ARPU e CPU */}
                    <div
                      className="stat-metrics"
                      style={{
                        marginTop: "1rem",
                        padding: "0.75rem",
                        backgroundColor: "var(--gray-50)",
                        borderRadius: "var(--border-radius)",
                        border: `1px solid ${scenario.colore}20`,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--gray-600)",
                              fontWeight: "500",
                              marginBottom: "0.25rem",
                            }}
                          >
                            ARPU Target
                          </div>
                          <div
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: "700",
                              color: scenario.colore,
                            }}
                          >
                            €{arpuTarget}
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--gray-600)",
                              fontWeight: "500",
                              marginBottom: "0.25rem",
                            }}
                          >
                            CPU
                          </div>
                          <div
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: "700",
                              color: scenario.colore,
                            }}
                          >
                            €{costoPerUtente.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Efficiency Ratio */}
                      <div
                        style={{
                          textAlign: "center",
                          padding: "0.5rem",
                          backgroundColor: "white",
                          borderRadius: "var(--border-radius-sm)",
                          border: `1px solid ${scenario.colore}30`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--gray-600)",
                            fontWeight: "500",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Efficiency Ratio
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            color:
                              efficiencyRatio > 2
                                ? "var(--success-color)"
                                : efficiencyRatio > 1
                                  ? "var(--warning-color)"
                                  : "var(--danger-color)",
                          }}
                        >
                          {efficiencyRatio.toFixed(1)}x
                        </div>
                        <div
                          style={{
                            fontSize: "0.625rem",
                            color: "var(--gray-500)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {efficiencyRatio > 2
                            ? "✅ Ottimo"
                            : efficiencyRatio > 1
                              ? "⚠️ Attenzione"
                              : "🔴 Critico"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="stat-footer">
                    <div className="stat-footer-text">
                      <span className="stat-highlight">
                        {scenario.utenti.toLocaleString()} utenti
                      </span>{" "}
                      • €
                      {totaliScenari[scenario.id]?.annuale.toLocaleString() ||
                        "0"}{" "}
                      all'anno
                      {![1000, 10000, 100000].includes(scenario.utenti) && (
                        <button
                          onClick={() => removeScenario(scenario.id)}
                          style={{
                            marginLeft: "0.5rem",
                            color: "var(--danger-color)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                          title="Rimuovi scenario"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layout principale */}
          <div className="main-layout">
            {/* Tabella Editabile Dinamica */}
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">Tabella Costi Multi-Scenario</h2>
                <p className="table-description">
                  Gestisci costi per tutti gli scenari. Clicca per modificare.
                </p>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Servizio</th>
                      {scenariOrdinati.map((scenario) => (
                        <th key={scenario.id} className="text-center">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                width: "0.75rem",
                                height: "0.75rem",
                                backgroundColor: scenario.colore,
                                borderRadius: "50%",
                              }}
                            />
                            {scenario.nome}
                          </div>
                        </th>
                      ))}
                      <th className="text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviziRicorrenti.map((servizio) => (
                      <tr key={servizio.id}>
                        <td>
                          <div className="service-name-cell">
                            {editingCell === `${servizio.id}-servizio` ? (
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input
                                  type="text"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="form-input"
                                  style={{ width: "120px" }}
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    saveEdit(servizio.id, "servizio", tempValue)
                                  }
                                  className="edit-btn edit-btn-save"
                                  style={{ padding: "0.25rem 0.5rem" }}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="edit-btn edit-btn-cancel"
                                  style={{ padding: "0.25rem 0.5rem" }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <strong
                                onClick={() =>
                                  startEditing(
                                    `${servizio.id}-servizio`,
                                    servizio.servizio,
                                  )
                                }
                                style={{ cursor: "pointer" }}
                                title="Clicca per modificare"
                              >
                                {servizio.servizio}
                              </strong>
                            )}
                          </div>
                        </td>

                        {/* Colonne dinamiche per ogni scenario */}
                        {scenariOrdinati.map((scenario, index) => {
                          const colonnaKey =
                            scenario.utenti === 1000
                              ? "costo1000"
                              : scenario.utenti === 10000
                                ? "costo10000"
                                : scenario.utenti === 100000
                                  ? "costo100000"
                                  : `costo${scenario.utenti}`;

                          let valore =
                            scenario.utenti === 1000
                              ? servizio.costo1000
                              : scenario.utenti === 10000
                                ? servizio.costo10000
                                : scenario.utenti === 100000
                                  ? servizio.costo100000
                                  : Number(servizio[colonnaKey]) || 0;

                          // Applica la formula speciale per Crossmint
                          if (servizio.servizio === "Crossmint") {
                            valore = calcolaCostoCrossmint(scenario.utenti);
                          }
                          // Applica la formula speciale per Veriff(KYC)
                          if (servizio.servizio === "Veriff(KYC)") {
                            valore = calcolaCostoVeriff(scenario.utenti);
                          }
                          // Applica la formula speciale per Supabase
                          if (servizio.servizio === "Supabase") {
                            valore = calcolaCostoSupabase(scenario.utenti);
                          }
                          // App Store e Play Store hanno costi fissi
                          if (servizio.servizio === "App Store") {
                            valore = 8.25; // 99€/anno = 8.25€/mese
                          }
                          if (servizio.servizio === "Play Store") {
                            valore = 2.08; 
                          }
                          const badgeClass =
                            index === 0
                              ? "cost-badge-primary"
                              : index === 1
                                ? "cost-badge-success"
                                : "cost-badge-warning";

                          const isEditing =
                            editingCell === `${servizio.id}-${colonnaKey}`;

                          return (
                            <td
                              key={scenario.id}
                              style={{ textAlign: "center" }}
                            >
                              {servizio.servizio === "Crossmint" ||
                              servizio.servizio === "Veriff(KYC)" ||
                              servizio.servizio === "Supabase" ||
                              servizio.servizio === "App Store" ||
                              servizio.servizio === "Play Store" ? (
                                <span
                                  className={`cost-badge ${badgeClass}`}
                                  style={{
                                    backgroundColor: scenario.colore + "20",
                                    color: scenario.colore,
                                    borderColor: scenario.colore + "40",
                                    cursor: "default",
                                  }}
                                  title={
                                    servizio.servizio === "Crossmint" ||
                                    servizio.servizio === "Veriff(KYC)" ||
                                    servizio.servizio === "Supabase"
                                      ? "Calcolato automaticamente con formula personalizzata"
                                      : "Costo fisso per tutti gli scenari"
                                  }
                                >
                                  €{valore.toFixed(2)}
                                </span>
                              ) : (
                                <div>
                                  {isEditing ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.25rem",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <input
                                        type="number"
                                        value={tempValue}
                                        onChange={(e) =>
                                          setTempValue(e.target.value)
                                        }
                                        className="form-input"
                                        style={{
                                          width: "60px",
                                          textAlign: "center",
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={() =>
                                          saveEdit(
                                            servizio.id,
                                            colonnaKey,
                                            tempValue,
                                          )
                                        }
                                        className="edit-btn edit-btn-save"
                                        style={{
                                          padding: "0.25rem 0.25rem",
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="edit-btn edit-btn-cancel"
                                        style={{
                                          padding: "0.25rem 0.25rem",
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <span
                                      className={`cost-badge ${badgeClass}`}
                                      style={{
                                        backgroundColor: scenario.colore + "20",
                                        color: scenario.colore,
                                        borderColor: scenario.colore + "40",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        startEditing(
                                          `${servizio.id}-${colonnaKey}`,
                                          valore,
                                        )
                                      }
                                      title="Clicca per modificare"
                                    >
                                      €{valore.toLocaleString()}
                                      {servizio.servizio === "AWS EC2" &&
                                        scenario.utenti === 100000 && (
                                          <span
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "var(--warning-color)",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            ⚠️
                                          </span>
                                        )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Azioni */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => removeServizio(servizio.id)}
                            className="edit-btn edit-btn-cancel"
                            title="Rimuovi servizio"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Riga Media Storage */}
                    <tr
                      style={{
                        backgroundColor: "var(--gray-100)",
                        borderTop: "2px solid var(--gray-200)",
                      }}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span style={{ fontSize: "1.2rem" }}>💾</span>
                          <strong>Media Storage</strong>
                        </div>
                      </td>
                      {scenariOrdinati.map((scenario, index) => {
                        const costoStorageMedia = mediaTable.reduce(
                          (sum, media) => {
                            return (
                              sum +
                              calcolaCostoStorage(
                                media.weightGB,
                                media.maxPerCustomer,
                                scenario.utenti,
                              )
                            );
                          },
                          0,
                        );

                        const badgeClass =
                          index === 0
                            ? "cost-badge-primary"
                            : index === 1
                              ? "cost-badge-success"
                              : "cost-badge-warning";
                        return (
                          <td key={scenario.id} style={{ textAlign: "center" }}>
                            <span
                              className={`cost-badge ${badgeClass}`}
                              style={{
                                backgroundColor: scenario.colore + "20",
                                color: scenario.colore,
                                borderColor: scenario.colore + "40",
                                cursor: "default",
                              }}
                              title={`Foto: €${calcolaCostoStorage(mediaTable[0].weightGB, mediaTable[0].maxPerCustomer, scenario.utenti).toFixed(4)} | Audio: €${calcolaCostoStorage(mediaTable[1].weightGB, mediaTable[1].maxPerCustomer, scenario.utenti).toFixed(4)} | Video: €${calcolaCostoStorage(mediaTable[2].weightGB, mediaTable[2].maxPerCustomer, scenario.utenti).toFixed(4)}`}
                            >
                              €{costoStorageMedia.toFixed(4)}
                            </span>
                          </td>
                        );
                      })}
                      <td></td>
                    </tr>

                    {/* Riga totali */}
                    <tr
                      style={{
                        backgroundColor: "var(--gray-50)",
                        fontWeight: "bold",
                      }}
                    >
                      <td>
                        <strong>💰 TOTALE MENSILE (con Storage)</strong>
                      </td>
                      {scenariOrdinati.map((scenario, index) => {
                        const badgeClass =
                          index === 0
                            ? "cost-badge-primary"
                            : index === 1
                              ? "cost-badge-success"
                              : "cost-badge-warning";
                        return (
                          <td key={scenario.id} style={{ textAlign: "center" }}>
                            <span
                              className={`cost-badge ${badgeClass} cost-badge-total`}
                              style={{
                                backgroundColor: scenario.colore + "20",
                                color: scenario.colore,
                                borderColor: scenario.colore + "40",
                              }}
                            >
                              €
                              {totaliScenari[
                                scenario.id
                              ]?.mensile.toLocaleString() || "0"}
                            </span>
                          </td>
                        );
                      })}
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sezione Totali Annuali */}
              <div
                style={{
                  padding: "1.5rem",
                  borderTop: "2px solid var(--gray-200)",
                  backgroundColor: "var(--gray-50)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "var(--gray-900)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  📅 Totali Costi Annuali
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${scenariOrdinati.length}, 1fr)`,
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {scenariOrdinati.map((scenario, index) => {
                    const totaleAnnuale =
                      totaliScenari[scenario.id]?.annuale || 0;
                    const totaleMensile =
                      totaliScenari[scenario.id]?.mensile || 0;
                    const differenzaPercentuale =
                      index > 0
                        ? ((totaleAnnuale -
                            (totaliScenari[scenariOrdinati[0].id]?.annuale ||
                              0)) /
                            (totaliScenari[scenariOrdinati[0].id]?.annuale ||
                              1)) *
                          100
                        : 0;

                    return (
                      <div
                        key={scenario.id}
                        style={{
                          background: "white",
                          borderRadius: "var(--border-radius-lg)",
                          padding: "1.25rem",
                          boxShadow: "var(--shadow)",
                          border: `2px solid ${scenario.colore}20`,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: scenario.colore,
                          }}
                        />

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: scenario.colore,
                              borderRadius: "50%",
                            }}
                          />
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "var(--gray-800)",
                            }}
                          >
                            {scenario.nome}
                          </h4>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <div
                            style={{
                              fontSize: "1.75rem",
                              fontWeight: "800",
                              color: scenario.colore,
                              marginBottom: "0.25rem",
                            }}
                          >
                            €{totaleAnnuale.toLocaleString()}
                          </div>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-600)",
                              fontWeight: "500",
                            }}
                          >
                            €{totaleMensile.toLocaleString()}/mese × 12
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--gray-500)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {scenario.utenti.toLocaleString()} utenti
                        </div>

                        {index > 0 && differenzaPercentuale !== 0 && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "50px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor:
                                differenzaPercentuale > 0
                                  ? "rgba(220, 38, 38, 0.1)"
                                  : "rgba(34, 197, 94, 0.1)",
                              color:
                                differenzaPercentuale > 0
                                  ? "var(--danger-color)"
                                  : "var(--success-color)",
                            }}
                          >
                            {differenzaPercentuale > 0 ? "↗️" : "↘️"}
                            {Math.abs(differenzaPercentuale).toFixed(0)}% vs{" "}
                            {scenariOrdinati[0].nome}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Riepilogo Comparativo */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)",
                    border: "1px solid rgba(37, 99, 235, 0.1)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <TrendingUp
                      size={16}
                      style={{ color: "var(--primary-color)" }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "var(--primary-color)",
                      }}
                    >
                      Analisi Comparativa Annuale
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "0.75rem",
                      fontSize: "0.8125rem",
                      color: "var(--gray-700)",
                    }}
                  >
                    <div>
                      <strong>Scenario più economico:</strong>
                      <br />
                      {
                        scenariOrdinati.reduce((min, scenario) =>
                          (totaliScenari[scenario.id]?.annuale || 0) <
                          (totaliScenari[min.id]?.annuale || Infinity)
                            ? scenario
                            : min,
                        ).nome
                      }{" "}
                      - €
                      {Math.min(
                        ...scenariOrdinati.map(
                          (s) => totaliScenari[s.id]?.annuale || 0,
                        ),
                      ).toLocaleString()}
                    </div>

                    <div>
                      <strong>Scenario più costoso:</strong>
                      <br />
                      {
                        scenariOrdinati.reduce((max, scenario) =>
                          (totaliScenari[scenario.id]?.annuale || 0) >
                          (totaliScenari[max.id]?.annuale || 0)
                            ? scenario
                            : max,
                        ).nome
                      }{" "}
                      - €
                      {Math.max(
                        ...scenariOrdinati.map(
                          (s) => totaliScenari[s.id]?.annuale || 0,
                        ),
                      ).toLocaleString()}
                    </div>

                    <div>
                      <strong>Differenza massima:</strong>
                      <br />€
                      {(
                        Math.max(
                          ...scenariOrdinati.map(
                            (s) => totaliScenari[s.id]?.annuale || 0,
                          ),
                        ) -
                        Math.min(
                          ...scenariOrdinati.map(
                            (s) => totaliScenari[s.id]?.annuale || 0,
                          ),
                        )
                      ).toLocaleString()}{" "}
                      annui
                    </div>

                    <div>
                      <strong>Media annuale:</strong>
                      <br />€
                      {Math.round(
                        scenariOrdinati.reduce(
                          (sum, s) => sum + (totaliScenari[s.id]?.annuale || 0),
                          0,
                        ) / scenariOrdinati.length,
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controlli Crossmint - SPOSTATI SOTTO I TOTALI */}
              <div className="crossmint-controls">
                <h3 className="crossmint-title">⚙️ Parametri Dinamici</h3>

                {/* Warning AWS */}
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "var(--border-radius)",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--warning-color)",
                      fontWeight: "600",
                    }}
                  >
                    ⚠️ <strong>Nota importante AWS EC2:</strong>
                  </div>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.8rem",
                      color: "var(--gray-700)",
                      lineHeight: "1.4",
                    }}
                  >
                    Il costo AWS raddoppia per 100K utenti (da €15 a €30/mese).
                    Considera soluzioni di ottimizzazione come auto-scaling,
                    istanze reserved o architetture serverless.
                  </p>
                </div>

                <div className="crossmint-inputs">
                  <div className="crossmint-input-group">
                    <label className="crossmint-label">
                      Percentuale Utenti Attivi (%)
                    </label>
                    <input
                      type="number"
                      value={percentualeUtentiAttivi}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setPercentualeUtentiAttivi(value);
                        }
                      }}
                      className="crossmint-input"
                      placeholder="5"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="crossmint-input-group">
                    <label className="crossmint-label">
                      Numero update mensili cv
                    </label>
                    <input
                      type="number"
                      value={numeroUpdateMint}
                      onChange={(e) =>
                        setNumeroUpdateMint(Number(e.target.value))
                      }
                      className="crossmint-input"
                      placeholder="2"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="crossmint-input-group">
                    <label className="crossmint-label">
                      Percentuale Utenti Certificatori (%)
                    </label>
                    <input
                      type="number"
                      value={percentualeCertificatori}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setPercentualeCertificatori(value);
                        }
                      }}
                      className="crossmint-input"
                      placeholder="10"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="crossmint-preview">
                    <div className="crossmint-preview-title">
                      Anteprima Costi:
                    </div>
                    <div className="crossmint-preview-values">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-700)",
                            }}
                          >
                            Crossmint ({percentualeUtentiAttivi}% attivi):
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>
                              1K: €{calcolaCostoCrossmint(1000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              10K: €{calcolaCostoCrossmint(10000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              100K: €{calcolaCostoCrossmint(100000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <strong
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-700)",
                            }}
                          >
                            Veriff(KYC) ({percentualeCertificatori}%
                            certificatori):
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>
                              1K: €{calcolaCostoVeriff(1000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              10K: €{calcolaCostoVeriff(10000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              100K: €{calcolaCostoVeriff(100000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <strong
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-700)",
                            }}
                          >
                            Supabase ({percentualeUtentiAttivi}% attivi):
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>
                              1K: €{calcolaCostoSupabase(1000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              10K: €{calcolaCostoSupabase(10000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              100K: €{calcolaCostoSupabase(100000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spiegazione Utenti Attivi */}
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "rgba(37, 99, 235, 0.05)",
                      border: "1px solid rgba(37, 99, 235, 0.2)",
                      borderRadius: "var(--border-radius)",
                      marginTop: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
                      <strong style={{ color: "var(--primary-color)" }}>
                        Spiegazione Utenti Attivi
                      </strong>
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--gray-700)",
                        lineHeight: "1.5",
                      }}
                    >
                      <p style={{ margin: "0 0 0.5rem 0" }}>
                        <strong>Formula:</strong> Utenti Attivi = Numero Totale
                        Utenti × (Percentuale Attivi ÷ 100)
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "1rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "var(--border-radius-sm)",
                            border: "1px solid var(--gray-200)",
                          }}
                        >
                          <strong>
                            1K Utenti ({percentualeUtentiAttivi}% attivi):
                          </strong>
                          <br />
                          1,000 × ({percentualeUtentiAttivi} ÷ 100) ={" "}
                          <strong>
                            {Math.round(
                              (1000 * percentualeUtentiAttivi) / 100,
                            ).toLocaleString()}
                          </strong>{" "}
                          utenti attivi
                        </div>
                        <div
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "var(--border-radius-sm)",
                            border: "1px solid var(--gray-200)",
                          }}
                        >
                          <strong>
                            10K Utenti ({percentualeUtentiAttivi}% attivi):
                          </strong>
                          <br />
                          10,000 × ({percentualeUtentiAttivi} ÷ 100) ={" "}
                          <strong>
                            {Math.round(
                              (10000 * percentualeUtentiAttivi) / 100,
                            ).toLocaleString()}
                          </strong>{" "}
                          utenti attivi
                        </div>
                        <div
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "var(--border-radius-sm)",
                            border: "1px solid var(--gray-200)",
                          }}
                        >
                          <strong>
                            100K Utenti ({percentualeUtentiAttivi}% attivi):
                          </strong>
                          <br />
                          100,000 × ({percentualeUtentiAttivi} ÷ 100) ={" "}
                          <strong>
                            {Math.round(
                              (100000 * percentualeUtentiAttivi) / 100,
                            ).toLocaleString()}
                          </strong>{" "}
                          utenti attivi
                        </div>
                      </div>
                      <p
                        style={{
                          margin: "0.75rem 0 0 0",
                          fontSize: "0.8rem",
                          color: "var(--gray-600)",
                        }}
                      >
                        Questi utenti attivi vengono utilizzati per calcolare i
                        costi di Crossmint e Supabase che dipendono
                        dall'utilizzo effettivo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nuova Tabella Media */}
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">📱 Tabella Specifiche Media</h2>
                <p className="table-description">
                  Gestisci specifiche per foto, audio e video. Clicca per
                  modificare.
                </p>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Media Type</th>
                      <th>N° max / customer</th>
                      <th>Duration</th>
                      <th>Weight (GB)</th>
                      <th>Storage Cost / 1K users</th>
                      <th>Storage Cost / 10K users</th>
                      <th>Storage Cost / 100K users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaTable.map((media) => (
                      <tr key={media.id}>
                        <td>
                          <div className="service-name-cell">
                            {editingCell === `${media.id}-tipo` ? (
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input
                                  type="text"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="form-input"
                                  style={{ width: "80px" }}
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    saveEditMedia(media.id, "tipo", tempValue)
                                  }
                                  className="edit-btn edit-btn-save"
                                  style={{ padding: "0.25rem 0.5rem" }}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="edit-btn edit-btn-cancel"
                                  style={{ padding: "0.25rem 0.5rem" }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <strong
                                onClick={() =>
                                  startEditingMedia(
                                    `${media.id}-tipo`,
                                    media.tipo,
                                  )
                                }
                                style={{ cursor: "pointer" }}
                                title="Clicca per modificare"
                              >
                                {media.tipo}
                              </strong>
                            )}
                          </div>
                        </td>
                        <td>
                          {editingCell === `${media.id}-maxPerCustomer` ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "0.25rem",
                                justifyContent: "center",
                              }}
                            >
                              <input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="form-input"
                                style={{ width: "60px", textAlign: "center" }}
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  saveEditMedia(
                                    media.id,
                                    "maxPerCustomer",
                                    tempValue,
                                  )
                                }
                                className="edit-btn edit-btn-save"
                                style={{
                                  padding: "0.25rem 0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="edit-btn edit-btn-cancel"
                                style={{
                                  padding: "0.25rem 0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() =>
                                startEditingMedia(
                                  `${media.id}-maxPerCustomer`,
                                  media.maxPerCustomer,
                                )
                              }
                              style={{ cursor: "pointer" }}
                              title="Clicca per modificare"
                            >
                              {media.maxPerCustomer}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${media.id}-duration` ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "0.25rem",
                                justifyContent: "center",
                              }}
                            >
                              <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="form-input"
                                style={{ width: "80px", textAlign: "center" }}
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  saveEditMedia(media.id, "duration", tempValue)
                                }
                                className="edit-btn edit-btn-save"
                                style={{
                                  padding: "0.25rem 0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="edit-btn edit-btn-cancel"
                                style={{
                                  padding: "0.25rem 0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() =>
                                startEditingMedia(
                                  `${media.id}-duration`,
                                  media.duration,
                                )
                              }
                              style={{ cursor: "pointer" }}
                              title="Clicca per modificare"
                            >
                              {media.duration}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${media.id}-weightGB` ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "0.25rem",
                                justifyContent: "center",
                              }}
                            >
                              <input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="form-input"
                                style={{ width: "80px", textAlign: "center" }}
                                step="0.000001"
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  saveEditMedia(media.id, "weightGB", tempValue)
                                }
                                className="edit-btn edit-btn-save"
                                style={{
                                  padding: "0.25rem 0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="edit-btn edit-btn-cancel"
                                style={{
                                  padding: "0.25rem 0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              onClick={() =>
                                startEditingMedia(
                                  `${media.id}-weightGB`,
                                  media.weightGB,
                                )
                              }
                              style={{ cursor: "pointer" }}
                              title="Clicca per modificare"
                            >
                              {media.weightGB.toFixed(6)} GB
                              <br />
                              <small
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--gray-600)",
                                }}
                              >
                                ({(media.weightGB * 1024).toFixed(2)} MB)
                              </small>
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="cost-badge cost-badge-primary">
                            €
                            {calcolaCostoStorage(
                              media.weightGB,
                              media.maxPerCustomer,
                              1000,
                            ).toFixed(4)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="cost-badge cost-badge-success">
                            €
                            {calcolaCostoStorage(
                              media.weightGB,
                              media.maxPerCustomer,
                              10000,
                            ).toFixed(4)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="cost-badge cost-badge-warning">
                            €
                            {calcolaCostoStorage(
                              media.weightGB,
                              media.maxPerCustomer,
                              100000,
                            ).toFixed(4)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Info Storage */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--gray-50)",
                  borderRadius: "var(--border-radius)",
                  marginTop: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>💾</span>
                  <strong>Informazioni Storage</strong>
                </div>
                <p
                  style={{
                    margin: "0",
                    fontSize: "0.875rem",
                    color: "var(--gray-700)",
                  }}
                >
                  <strong>Costo storage:</strong> $0.021 per gigabyte al mese
                  <br />
                  <strong>Formula:</strong> (Weight GB × Max per customer ×
                  Numero utenti) × $0.021
                </p>
              </div>

              {/* Riepilogo Costi Storage per Scenario */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--white)",
                  borderRadius: "var(--border-radius)",
                  marginTop: "1rem",
                  border: "1px solid var(--gray-200)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>📊</span>
                  <strong>Riepilogo Costi Storage per Scenario</strong>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {scenariOrdinati.map((scenario) => {
                    const costoFoto = calcolaCostoStorage(
                      mediaTable[0].weightGB,
                      mediaTable[0].maxPerCustomer,
                      scenario.utenti,
                    );
                    const costoAudio = calcolaCostoStorage(
                      mediaTable[1].weightGB,
                      mediaTable[1].maxPerCustomer,
                      scenario.utenti,
                    );
                    const costoVideo = calcolaCostoStorage(
                      mediaTable[2].weightGB,
                      mediaTable[2].maxPerCustomer,
                      scenario.utenti,
                    );
                    const costoTotal = costoFoto + costoAudio + costoVideo;

                    return (
                      <div
                        key={scenario.id}
                        style={{
                          padding: "1rem",
                          backgroundColor: "var(--gray-50)",
                          borderRadius: "var(--border-radius)",
                          border: `2px solid ${scenario.colore}20`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: scenario.colore,
                              borderRadius: "50%",
                            }}
                          />
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "var(--gray-800)",
                            }}
                          >
                            {scenario.nome}
                          </h4>
                        </div>

                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--gray-700)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <span>Foto Storage:</span>
                            <strong>€{costoFoto.toFixed(6)}</strong>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <span>Audio Storage:</span>
                            <strong>€{costoAudio.toFixed(6)}</strong>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span>Video Storage:</span>
                            <strong>€{costoVideo.toFixed(6)}</strong>
                          </div>
                          <div
                            style={{
                              padding: "0.5rem",
                              backgroundColor: "white",
                              borderRadius: "var(--border-radius-sm)",
                              border: `1px solid ${scenario.colore}30`,
                              textAlign: "center",
                              fontWeight: "600",
                              color: scenario.colore,
                            }}
                          >
                            Totale: €{costoTotal.toFixed(6)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grafici Dinamici */}
            <div className="charts-section">
              {scenariOrdinati.map((scenario) => (
                <div key={scenario.id} className="chart-card">
                  <div className="chart-header">
                    <div
                      className="chart-indicator"
                      style={{ backgroundColor: scenario.colore }}
                    />
                    <div>
                      <h3 className="chart-title">{scenario.nome}</h3>
                      <p className="chart-subtitle">
                        €
                        {totaliScenari[scenario.id]?.mensile.toLocaleString() ||
                          "0"}
                        /mese
                      </p>
                    </div>
                    {![1000, 10000, 100000].includes(scenario.utenti) && (
                      <button
                        onClick={() => removeScenario(scenario.id)}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--danger-color)",
                        }}
                        title="Rimuovi scenario"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="chart-body">
                    <Bar
                      data={getChartDataForScenario(scenario)}
                      options={chartOptions}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Planning Strategy Section */}
          <div className="business-strategy-section">
            <div className="strategy-header">
              <div className="strategy-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="strategy-title">
                  🎯 Strategia Business Planning
                </h2>
                <p className="strategy-subtitle">
                  Piano strategico basato sui tuoi scenari di costo
                </p>
              </div>
            </div>

            {/* Fasi della Strategia */}
            <div className="strategy-phases">
              {/* Fase 1: Analisi Scenari */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">1</div>
                  <h3 className="phase-title">
                    📈 Analisi Scenari di Crescita
                  </h3>
                </div>
                <div className="phase-content">
                  <div className="phase-grid">
                    <div className="phase-card">
                      <h4>🎯 Scenari Strategici Raccomandati</h4>
                      <ul>
                        <li>
                          <strong>MVP Launch:</strong> 500-1K utenti
                        </li>
                        <li>
                          <strong>Product-Market Fit:</strong> 5K-10K utenti
                        </li>
                        <li>
                          <strong>Scale-Up:</strong> 50K utenti
                        </li>
                        <li>
                          <strong>Market Leader:</strong> 100K+ utenti
                        </li>
                      </ul>
                    </div>
                    <div className="phase-card">
                      <h4>💰 Break-Even Analysis</h4>
                      <div className="metric-row">
                        <span>ARPU Target:</span>
                        <span className="metric-value">€50 (fisso)</span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--gray-600)",
                          marginTop: "0.5rem",
                        }}
                      >
                        I valori ARPU e CPU sono ora visualizzati direttamente
                        nelle schede degli scenari sopra.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 2: Ottimizzazione Costi */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">2</div>
                  <h3 className="phase-title">💰 Ottimizzazione Costi</h3>
                </div>
                <div className="phase-content">
                  <div className="phase-grid">
                    <div className="phase-card">
                      <h4>🔴 Priorità Alta - Servizi Costosi</h4>
                      {serviziRicorrenti
                        .filter((s) => s.costo100000 > 50)
                        .sort((a, b) => b.costo100000 - a.costo100000)
                        .slice(0, 3)
                        .map((servizio) => (
                          <div key={servizio.id} className="priority-item high">
                            <strong>{servizio.servizio}</strong>
                            <span>€{servizio.costo100000}/mese</span>
                            <small>Negozia contratti volume</small>
                          </div>
                        ))}

                      {/* Warning specifico per AWS */}
                      <div
                        style={{
                          background: "rgba(245, 158, 11, 0.1)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          borderRadius: "var(--border-radius)",
                          padding: "0.75rem",
                          marginTop: "1rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.8rem",
                            color: "var(--warning-color)",
                            fontWeight: "600",
                            marginBottom: "0.25rem",
                          }}
                        >
                          ⚠️ AWS EC2 - Scalabilità Critica
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--gray-700)",
                          }}
                        >
                          Crescita: +100% (€15→€30) per 100K utenti
                          <br />
                          <strong>Azioni:</strong> Auto-scaling, Reserved
                          Instances, Container optimization
                        </div>
                      </div>
                    </div>
                    <div className="phase-card">
                      <h4>🟡 Priorità Media - Crescita Variabile</h4>
                      {serviziRicorrenti
                        .filter((s) => {
                          const crescita = s.costo100000 / (s.costo1000 || 1);
                          return crescita > 1.5 && crescita < 3;
                        })
                        .slice(0, 3)
                        .map((servizio) => (
                          <div
                            key={servizio.id}
                            className="priority-item medium"
                          >
                            <strong>{servizio.servizio}</strong>
                            <span>
                              Crescita:{" "}
                              {(
                                (servizio.costo100000 /
                                  (servizio.costo1000 || 1)) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                            <small>Ottimizza utilizzo</small>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 3: Financial Planning */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">3</div>
                  <h3 className="phase-title">📊 Financial Planning</h3>
                </div>
                <div className="phase-content">
                  <div className="financial-timeline">
                    {scenariOrdinati.map((scenario, index) => (
                      <div key={scenario.id} className="timeline-item">
                        <div
                          className="timeline-marker"
                          style={{ backgroundColor: scenario.colore }}
                        ></div>
                        <div className="timeline-content">
                          <h4>
                            Anno {index + 1}: {scenario.nome}
                          </h4>
                          <div className="timeline-metrics">
                            <div className="timeline-metric">
                              <span>Budget IT:</span>
                              <strong>
                                €
                                {totaliScenari[
                                  scenario.id
                                ]?.annuale.toLocaleString()}
                              </strong>
                            </div>
                            <div className="timeline-metric">
                              <span>Buffer (+30%):</span>
                              <strong>
                                €
                                {Math.round(
                                  (totaliScenari[scenario.id]?.annuale || 0) *
                                    1.3,
                                ).toLocaleString()}
                              </strong>
                            </div>
                            <div className="timeline-metric">
                              <span>Investimenti:</span>
                              <strong>
                                €
                                {Math.round(
                                  (totaliScenari[scenario.id]?.annuale || 0) *
                                    0.2,
                                ).toLocaleString()}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fase 4: Risk Management */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">4</div>
                  <h3 className="phase-title">⚠️ Risk Management</h3>
                </div>
                <div className="phase-content">
                  <div className="risk-matrix">
                    <div className="risk-card high-risk">
                      <h4>🔴 Alto Rischio</h4>
                      <p>
                        <strong>Crescita Accelerata (+200%)</strong>
                      </p>
                      <p>
                        Budget necessario: €
                        {Math.round(
                          (totaliScenari[
                            scenariOrdinati[scenariOrdinati.length - 1]?.id
                          ]?.annuale || 0) * 2,
                        ).toLocaleString()}
                      </p>
                      <small>Prepara contratti scalabili</small>
                    </div>
                    <div className="risk-card medium-risk">
                      <h4>🟡 Medio Rischio</h4>
                      <p>
                        <strong>Stagnazione Crescita</strong>
                      </p>
                      <p>Ottimizzazione: -30% costi</p>
                      <small>Rivedi servizi non essenziali</small>
                    </div>
                    <div className="risk-card low-risk">
                      <h4>🟢 Basso Rischio</h4>
                      <p>
                        <strong>Crescita Lineare</strong>
                      </p>
                      <p>Scenario attuale mantieni</p>
                      <small>Monitoraggio standard</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 5: KPI Dashboard */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">5</div>
                  <h3 className="phase-title">📋 KPI Dashboard</h3>
                </div>
                <div className="phase-content">
                  <div className="kpi-grid">
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "1rem",
                        backgroundColor: "var(--gray-50)",
                        borderRadius: "var(--border-radius)",
                        border: "1px solid var(--gray-200)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "var(--gray-700)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        📊 KPI Dashboard
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--gray-600)",
                        }}
                      >
                        I valori ARPU, CPU ed Efficiency Ratio sono ora
                        visualizzati direttamente nelle schede degli scenari
                        principali sopra.
                        <br />
                        Ogni scheda mostra: ARPU Target (€50), Cost Per User
                        (CPU) e l'Efficiency Ratio calcolato automaticamente.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 6: Action Plan */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">6</div>
                  <h3 className="phase-title">🚀 Action Plan</h3>
                </div>
                <div className="phase-content">
                  <div className="action-timeline">
                    <div className="action-item">
                      <div className="action-period">Settimana 1-2</div>
                      <div className="action-tasks">
                        <div className="action-task">
                          ✅ Setup scenari nel calculator
                        </div>
                        <div className="action-task">
                          📊 Ricerca benchmark industry
                        </div>
                        <div className="action-task">💰 Define ARPU target</div>
                      </div>
                    </div>
                    <div className="action-item">
                      <div className="action-period">Settimana 3-4</div>
                      <div className="action-tasks">
                        <div className="action-task">🔍 Analisi gap costi</div>
                        <div className="action-task">🤝 Vendor negotiation</div>
                        <div className="action-task">⚠️ Risk assessment</div>
                      </div>
                    </div>
                    <div className="action-item">
                      <div className="action-period">Mese 2</div>
                      <div className="action-tasks">
                        <div className="action-task">✅ Budget approval</div>
                        <div className="action-task">
                          📈 KPI dashboard setup
                        </div>
                        <div className="action-task">
                          🔄 Monthly review processo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Framework */}
            <div className="decision-framework">
              <h3>🎯 Decision Framework</h3>
              <div className="decision-grid">
                <div className="decision-card go">
                  <h4>✅ GO Criteria</h4>
                  <ul>
                    <li>Cost per User &lt; 30% ARPU</li>
                    <li>Break-even &lt; 12 mesi</li>
                    <li>Budget variance &lt; 20%</li>
                  </ul>
                </div>
                <div className="decision-card no-go">
                  <h4>❌ NO-GO Criteria</h4>
                  <ul>
                    <li>Costi crescono &gt;2x vs utenti</li>
                    <li>ROI negativo &gt;18 mesi</li>
                    <li>Dipendenza critica 1 vendor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="info-header">
              <div className="info-icon">
                <Settings size={20} />
              </div>
              <h3 className="info-title">Gestione Scenari Personalizzati</h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <strong>Scenari attivi:</strong> {scenariCustom.length}
              </div>
              <div className="info-item">
                <strong>Scenari custom:</strong>{" "}
                {
                  scenariCustom.filter(
                    (s) => ![1000, 10000, 100000].includes(s.utenti),
                  ).length
                }
              </div>
              <div className="info-item">
                <strong>Servizi monitorati:</strong> {serviziRicorrenti.length}
              </div>
              <div className="info-item">
                <strong>Tip:</strong> Usa la strategia sopra per ottimizzare i
                costi
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-info">
              <div className="status-dot"></div>
              Ultima modifica: {new Date().toLocaleString("it-IT")}
            </div>
            <div className="footer-info">
              {scenariCustom.length} scenari configurati
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
