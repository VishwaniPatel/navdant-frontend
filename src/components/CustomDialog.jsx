import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const DialogContext = createContext(undefined);

export const DialogProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);

  const [options, setOptions] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    destructive: false,
  });

  const showDialog = useCallback((opts) => {
    setOptions({
      title: opts.title || "",
      message: opts.message || "",
      onConfirm: opts.onConfirm || (() => {}),
      onCancel: opts.onCancel || (() => {}),
      confirmText: opts.confirmText || "OK",
      cancelText: opts.cancelText || "Cancel",
      showCancel: opts.showCancel || false,
      destructive: opts.destructive || false,
    });

    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = () => {
    options.onConfirm?.();
    hideDialog();
  };

  const handleCancel = () => {
    options.onCancel?.();
    hideDialog();
  };

  return (
    <DialogContext.Provider
      value={{
        showDialog,
        hideDialog,
      }}
    >
      {children}

      {visible && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-[600px]
              rounded-2xl
              bg-white
              px-6
              py-5
              shadow-2xl
            "
          >
            {/* Title */}
            <h2 className="mb-2 text-lg font-medium text-slate-800">
              {options.title}
            </h2>

            {/* Message */}
            <p className="mb-6 text-sm leading-5 text-slate-600">
              {options.message}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              {options.showCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="
                    min-w-[64px]
                    rounded-lg
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-slate-500
                    transition
                    hover:bg-slate-100
                  "
                >
                  {options.cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                className={`
                  min-w-[64px]
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition
                  ${
                    options.destructive
                      ? "text-red-500 hover:bg-red-50"
                      : "text-[#0B1E41] hover:bg-slate-100"
                  }
                `}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error(
      "useDialog must be used within a DialogProvider"
    );
  }

  return context;
};

export default DialogProvider;