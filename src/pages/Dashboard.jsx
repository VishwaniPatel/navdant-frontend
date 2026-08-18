import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  CalendarDays,
  ArrowUpRight,
  Clock,
  Activity,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PatientService from "../services/patients.service";

function Dashboard() {
  const navigate = useNavigate();

  const [totalPatients, setTotalPatients] = useState(0);
  const [monthlyPatients, setMonthlyPatients] = useState(0);
  const [todayPatients, setTodayPatients] = useState(0);

  const [recentPatients, setRecentPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  // ==========================================
  // Greeting / Date
  // ==========================================
  const fetchMonthlyStats = useCallback(async () => {
  try {
    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const response =
        await PatientService.getPatientReport({
          registration_month: `${year}-${month}`,
        });

      const patients =
        response?.patients ??
        response?.data ??
        response?.results ??
        [];

      const count =
        response?.total ??
        response?.count ??
        patients.length ??
        0;

      months.push({
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        count,
      });
    }

    setMonthlyStats(months);
  } catch (error) {
    console.error(
      "Monthly stats error:",
      error
    );
  }
}, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  };

  // ==========================================
  // Fetch Dashboard Data
  // ==========================================

  const fetchDashboardData = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const now = new Date();

        const year = now.getFullYear();

        const month = String(
          now.getMonth() + 1
        ).padStart(2, "0");

        const today = [
          year,
          month,
          String(now.getDate()).padStart(2, "0"),
        ].join("-");

        // =====================================
        // Total Patients
        // =====================================

        const totalResponse =
          await PatientService.getAllPatients({
            page: 1,
            limit: 10,
          });

        console.log(
          "Total Patients Response:",
          totalResponse
        );

        const total =
          totalResponse?.total ??
          totalResponse?.count ??
          totalResponse?.totalPatients ??
          0;

        setTotalPatients(total);

        // =====================================
        // Recent Patients
        // =====================================

        const recentResponse =
          await PatientService.getAllPatients({
            page: 1,
            limit: 5,
          });

        console.log(
          "Recent Patients Response:",
          recentResponse
        );

        const patients =
          recentResponse?.patients ??
          recentResponse?.data ??
          recentResponse?.results ??
          [];

        setRecentPatients(patients);

        // =====================================
        // Monthly Patients
        // =====================================

        const monthlyResponse =
          await PatientService.getPatientReport({
            registration_month:
              `${year}-${month}`,
          });

        console.log(
          "Monthly Patient Response:",
          monthlyResponse
        );

        const monthlyList =
          monthlyResponse?.patients ??
          monthlyResponse?.data ??
          monthlyResponse?.results ??
          [];

        setMonthlyPatients(
          monthlyResponse?.total ??
            monthlyResponse?.count ??
            monthlyList.length ??
            0
        );

        // =====================================
        // Today's Patients
        // =====================================

        const todayResponse =
          await PatientService.getPatientReport({
            registration_date: today,
          });

        console.log(
          "Today's Patient Response:",
          todayResponse
        );

        const todayList =
          todayResponse?.patients ??
          todayResponse?.data ??
          todayResponse?.results ??
          [];

        setTodayPatients(
          todayResponse?.total ??
            todayResponse?.count ??
            todayList.length ??
            0
        );
      } catch (error) {
        console.error(
          "Dashboard API Error:",
          error
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

 useEffect(() => {
  fetchDashboardData();
  fetchMonthlyStats();
}, [
  fetchDashboardData,
  fetchMonthlyStats,
]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // Helpers
  // ==========================================

  const getPatientName = (patient) => {
    return (
      patient?.name ||
      patient?.full_name ||
      patient?.patient_name ||
      "Unknown Patient"
    );
  };

  const getCaseNumber = (patient) => {
    return (
      patient?.case_number ||
      patient?.case_no ||
      patient?.caseNumber ||
      patient?.registration_number ||
      "-"
    );
  };

  const getTreatment = (patient) => {
    return (
      patient?.treatment ||
      patient?.treatment_name ||
      patient?.treatment_type ||
      patient?.diagnosis ||
      "Consultation"
    );
  };

  const getRegistrationDate = (patient) => {
    const date =
      patient?.registration_date ||
      patient?.created_date ||
      patient?.created_at ||
      patient?.createdAt;

    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getPatientInitial = (patient) => {
    return getPatientName(patient)
      .charAt(0)
      .toUpperCase();
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-secondary">
            {getGreeting()} 👋
          </p>

          <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
            Welcome Back
          </h1>

          <p className="mt-1 text-sm text-neutral">
            Here's what's happening in your clinic
            today.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <CalendarDays className="h-4 w-4 text-primary" />

            <span className="text-sm font-medium text-primary">
              {currentTime.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </span>
          </div>

          <button
            onClick={() =>
              fetchDashboardData(true)
            }
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary shadow-sm transition hover:bg-tertiary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>

        </div>

      </div>

      {/* ========================================
          STAT CARDS
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          description="All time records"
          loading={loading}
          dark
        />

        <StatCard
          title="This Month's Patients"
          value={monthlyPatients}
          icon={CalendarDays}
          description="New registrations this month"
          loading={loading}
        />

        <StatCard
          title="Today's Patients"
          value={todayPatients}
          icon={UserPlus}
          description="Registered today"
          loading={loading}
        />

      </div>
        {/* ========================================
    MONTHLY CHART + QUICK ACTIONS
======================================== */}

<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

  {/* Monthly Chart */}

  <div className="xl:col-span-2">

    <MonthlyPatientChart
      data={monthlyStats}
    />

  </div>

  {/* Quick Actions */}

  <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">

    <div className="border-b border-slate-100 px-5 py-4">

      <h2 className="font-bold text-primary">
        Quick Actions
      </h2>

      <p className="mt-0.5 text-xs text-neutral">
        Frequently used actions
      </p>

    </div>

    <div className="grid grid-cols-1 gap-3 p-5">

      <QuickAction
        title="Add Patient"
        description="Register a new patient"
        icon={UserPlus}
        onClick={() =>
          navigate("/patients/register")
        }
      />

      <QuickAction
        title="View Patients"
        description="Manage patient records"
        icon={Users}
        onClick={() =>
          navigate("/patients")
        }
      />

    </div>

  </div>

</div>

    </div>
  );
}

/* ==========================================
   STAT CARD
========================================== */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  dark = false,
}) {
  return (
    <div
      className={`group rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        dark
          ? "border-primary bg-primary"
          : "border-slate-100 bg-white"
      }`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p
            className={`text-sm font-medium ${
              dark
                ? "text-white/70"
                : "text-neutral"
            }`}
          >
            {title}
          </p>

          {loading ? (
            <div
              className={`mt-3 h-9 w-24 animate-pulse rounded-lg ${
                dark
                  ? "bg-white/10"
                  : "bg-slate-100"
              }`}
            />
          ) : (
            <h3
              className={`mt-2 text-3xl font-bold ${
                dark
                  ? "text-white"
                  : "text-primary"
              }`}
            >
              {Number(value || 0).toLocaleString()}
            </h3>
          )}

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            dark
              ? "bg-white/10"
              : "bg-primary/10"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              dark
                ? "text-white"
                : "text-primary"
            }`}
          />
        </div>

      </div>

      <div
        className={`mt-4 flex items-center gap-1.5 text-xs ${
          dark
            ? "text-white/60"
            : "text-neutral"
        }`}
      >
        <ArrowUpRight
          className={`h-3.5 w-3.5 ${
            dark
              ? "text-green-300"
              : "text-secondary"
          }`}
        />

        {description}
      </div>

    </div>
  );
}

/* ==========================================
   OVERVIEW ITEM
========================================== */

function OverviewItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-tertiary p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div>
          <p className="text-xs text-neutral">
            {label}
          </p>

          <p className="text-xl font-bold text-primary">
            {Number(value || 0).toLocaleString()}
          </p>
        </div>

      </div>

    </div>
  );
}

/* ==========================================
   QUICK ACTION
========================================== */

function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-primary/20 hover:bg-tertiary"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-primary">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-neutral">
          {description}
        </p>

      </div>

      <ChevronRight className="h-4 w-4 text-neutral transition group-hover:translate-x-0.5" />

    </button>
  );
}

/* ==========================================
   RECENT PATIENT TABLE
========================================== */

function RecentPatientsTable({
  patients,
  getPatientName,
  getCaseNumber,
  getTreatment,
  getRegistrationDate,
  getPatientInitial,
  onPatientClick,
}) {
  return (
    <>
      {/* Desktop */}

      <div className="hidden overflow-x-auto md:block">

        <table className="w-full">

          <thead>
            <tr className="border-b border-slate-100 text-left">

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral">
                Patient
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral">
                Case Number
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral">
                Treatment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral">
                Registration Date
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {patients.map((patient, index) => {

              const id =
                patient?.id ||
                patient?.patient_id ||
                index;

              return (
                <tr
                  key={id}
                  onClick={() =>
                    onPatientClick(patient)
                  }
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-tertiary/50"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {getPatientInitial(
                          patient
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {getPatientName(
                            patient
                          )}
                        </p>

                        <p className="text-xs text-neutral">
                          Patient
                        </p>
                      </div>

                    </div>

                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-neutral">
                    {getCaseNumber(
                      patient
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-neutral">
                    {getTreatment(patient)}
                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2 text-sm text-neutral">
                      <Clock className="h-4 w-4" />

                      {getRegistrationDate(
                        patient
                      )}
                    </div>

                  </td>

                  <td className="px-5 py-4 text-right">

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onPatientClick(patient);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-secondary hover:bg-secondary/10"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      {/* Mobile */}

      <div className="divide-y divide-slate-100 md:hidden">

        {patients.map((patient, index) => {

          const id =
            patient?.id ||
            patient?.patient_id ||
            index;

          return (
            <button
              key={id}
              onClick={() =>
                onPatientClick(patient)
              }
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-tertiary"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {getPatientInitial(patient)}
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-primary">
                  {getPatientName(patient)}
                </p>

                <p className="mt-0.5 text-xs text-neutral">
                  {getCaseNumber(patient)}
                </p>

                <p className="mt-1 text-xs text-neutral">
                  {getRegistrationDate(patient)}
                </p>

              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-neutral" />

            </button>
          );
        })}

      </div>
    </>
  );
}

/* ==========================================
   LOADING SKELETON
========================================== */

function PatientTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">

      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 p-5"
        >

          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />

          <div className="flex-1 space-y-2">

            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />

            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />

          </div>

          <div className="hidden h-3 w-24 animate-pulse rounded bg-slate-100 sm:block" />

        </div>
      ))}

    </div>
  );
}

/* ==========================================
   EMPTY STATE
========================================== */

function EmptyPatients() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary">
        <Users className="h-6 w-6 text-neutral" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-primary">
        No patients found
      </h3>

      <p className="mt-1 text-xs text-neutral">
        Recently added patients will appear here.
      </p>

    </div>
  );
}
function MonthlyPatientChart({ data }) {
  const maxValue = Math.max(
    ...data.map((item) => item.count),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-100 px-5 py-4">

        <h2 className="font-bold text-primary">
          Monthly Patient Registrations
        </h2>

        <p className="mt-0.5 text-xs text-neutral">
          Patient registrations over the last 6 months
        </p>

      </div>

      {/* Chart */}

      <div className="p-5">

        <div className="flex h-[220px] items-end gap-3 sm:gap-5">

          {data.map((item, index) => {

            const height =
              item.count > 0
                ? Math.max(
                    (item.count / maxValue) * 100,
                    5
                  )
                : 3;

            return (
              <div
                key={`${item.month}-${index}`}
                className="flex h-full flex-1 flex-col justify-end"
              >

                {/* Count */}

                <div className="mb-2 text-center">
                  <span className="text-xs font-semibold text-primary">
                    {item.count}
                  </span>
                </div>

                {/* Bar */}

                <div className="flex h-[170px] items-end justify-center">

                  <div
                    className="w-full max-w-[42px] rounded-t-lg bg-secondary transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${item.month}: ${item.count} patients`}
                  />

                </div>

                {/* Month */}

                <p className="mt-2 text-center text-xs font-medium text-neutral">
                  {item.month}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
export default Dashboard;