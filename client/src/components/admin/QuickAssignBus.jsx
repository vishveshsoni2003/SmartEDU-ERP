import { useState } from "react";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import { createBus } from "../../services/adminApi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Alert from "../ui/Alert";

export default function QuickAssignBus({ routeId, routeName, onBusCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [busNumber, setBusNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!busNumber.trim()) {
      setError("Please enter a bus number");
      return;
    }

    if (!capacity || parseInt(capacity) < 1) {
      setError("Please enter a valid capacity");
      return;
    }

    setLoading(true);
    try {
      const busData = {
        busNumber: busNumber.trim(),
        capacity: parseInt(capacity),
        routeId: routeId
      };

      console.log("Creating bus:", busData);
      await createBus(busData);

      setSuccess(true);
      setBusNumber("");
      setCapacity("");

      // Close form after success
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        if (onBusCreated) {
          onBusCreated();
        }
      }, 1500);
    } catch (err) {
      console.error("Error creating bus:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create bus";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        icon={Plus}
        color="primary"
        variant="outline"
        size="sm"
        fullWidth
      >
        Assign Bus to This Route
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      {error && (
        <Alert variant="error" icon={AlertCircle} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={CheckCircle}>
          Bus assigned successfully!
        </Alert>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Assign Bus to <span className="text-blue-600 font-semibold">{routeName}</span>
        </p>

        <Input
          label="Bus Number"
          placeholder="e.g., BUS-001"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
          disabled={loading}
          size="sm"
        />

        <Input
          label="Capacity (Seats)"
          type="number"
          placeholder="e.g., 50"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          disabled={loading}
          min="1"
          size="sm"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!busNumber.trim() || !capacity || loading}
            isLoading={loading}
            size="sm"
            color="primary"
            fullWidth
          >
            Assign Bus
          </Button>
          <Button
            onClick={() => {
              setShowForm(false);
              setBusNumber("");
              setCapacity("");
              setError("");
            }}
            disabled={loading}
            variant="ghost"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
