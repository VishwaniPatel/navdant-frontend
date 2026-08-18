import { useCallback, useRef, useState } from "react";
import PatientService from "../services/patients.service";

export const usePatientPagination = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [totalPatients, setTotalPatients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);

  const filtersRef = useRef({
    search: "",
    year: null,
    month: null,
  });

  const fetchPatients = useCallback(
    async (
      page = 1,
      search = "",
      year = null,
      month = null,
      append = false
    ) => {
      if (fetchingRef.current) return;

      fetchingRef.current = true;

      append ? setLoadingMore(true) : setLoading(true);

      filtersRef.current = {
        search,
        year,
        month,
      };

      try {
        let response;

        /* =========================
           DATE FILTER API
        ========================= */

        if (year || (month && month !== "ALL")) {
          const params = {
            sort_by: "case_number",
            sort_order: "desc",
          };

          if (month && month !== "ALL") {
            const finalYear =
              year || new Date().getFullYear().toString();

            params.registration_month =
              `${finalYear}-${month.padStart(2, "0")}`;
          } else if (year) {
            params.registration_year = Number(year);
          }

          if (search.trim()) {
            if (/^\d+$/.test(search.trim())) {
              params.patient_id = Number(search.trim());
            } else {
              params.name = search.trim();
            }
          }

          response =
            await PatientService.getPatientReport(params);

          if (response?.status === "success") {
            const data = response.patients || [];

            setPatients(data);
            setTotalPatients(
              response.total ?? data.length
            );

            setHasMore(false);
          }
        }

        /* =========================
           NORMAL PAGINATION API
        ========================= */

        else {
          const params = {
            page,
            limit: 20,
            sort_by: "case_number",
            sort_order: "desc",
          };

          if (search.trim()) {
            params.search = search.trim();
          }

          response =
            await PatientService.getAllPatients(params);

          if (response?.status === "success") {
            const data = response.patients || [];
            const total = response.total || 0;

            setPatients((prev) =>
              append ? [...prev, ...data] : data
            );

            setTotalPatients(total);

            setHasMore(
              (append ? patients.length + data.length : data.length) <
                total &&
                data.length === params.limit
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load patients:",
          error
        );

        setPatients((prev) =>
          append ? prev : []
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [patients.length]
  );

  const resetAndFetch = useCallback(
    (search, year, month) => {
      setCurrentPage(1);
      setPatients([]);
      setHasMore(true);

      fetchPatients(
        1,
        search,
        year,
        month,
        false
      );
    },
    [fetchPatients]
  );

  const loadMore = useCallback(() => {
    if (
      loading ||
      loadingMore ||
      fetchingRef.current ||
      !hasMore
    ) {
      return;
    }

    const nextPage = currentPage + 1;

    setCurrentPage(nextPage);

    const {
      search,
      year,
      month,
    } = filtersRef.current;

    fetchPatients(
      nextPage,
      search,
      year,
      month,
      true
    );
  }, [
    currentPage,
    loading,
    loadingMore,
    hasMore,
    fetchPatients,
  ]);

  const refresh = useCallback(
    (search, year, month) => {
      resetAndFetch(
        search,
        year,
        month
      );
    },
    [resetAndFetch]
  );

  return {
    patients,
    loading,
    loadingMore,
    totalPatients,
    currentPage,
    hasMore,

    resetAndFetch,
    loadMore,
    refresh,
  };
};