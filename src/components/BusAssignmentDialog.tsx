import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { 
  fetchBusRoutes, 
  assignBusToStudent, 
  removeBusFromStudent,
  fetchStudentBusAssignment,
  BusRoute,
  BusAssignment
} from "@/store/slices/busSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Bus, Calendar, X, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { FeeStructure } from "@/lib/feeManagement";

interface BusAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | number;
  studentName: string;
  className: string;
  onSuccess?: () => void;
}

export function BusAssignmentDialog({
  isOpen,
  onClose,
  studentId,
  studentName,
  className,
  onSuccess,
}: BusAssignmentDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { routes, studentBusAssignment, loading, error } = useSelector(
    (state: RootState) => state.bus
  );
  const { structure: feeStructure } = useSelector(
    (state: RootState) => state.feeStructure
  );

  const [currentAssignment, setCurrentAssignment] = useState<BusAssignment | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<"assign" | "remove">("assign");

  // Get bus fee for student's class
  const studentClassFeeStructure = feeStructure.find(
    (f) => f.classname === className
  );
  const busFeeAmount = studentClassFeeStructure?.busFee || 0;

  useEffect(() => {
    console.log("BusAssignmentDialog opened for student:", studentId);
    if (isOpen) {
      console.log("Dispatching fetchBusRoutes...");
      dispatch(fetchBusRoutes());
      dispatch(fetchStudentBusAssignment(studentId)).then(() => {
        console.log("Student bus assignment fetched");
      }).catch(() => {
        console.log("Student bus assignment fetch failed");
      });
    }
  }, [isOpen, studentId, dispatch]);

  useEffect(() => {
    if (studentBusAssignment) {
      setCurrentAssignment(studentBusAssignment);
      if (activeTab === "remove") {
        setEndDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [studentBusAssignment, activeTab]);

  const handleAssignBus = async () => {
    if (!selectedBusId || !startDate) {
      toast.error("Please select a bus and start date");
      return;
    }

    const selectedRoute = routes.find(r => r._id === selectedBusId);
    if (!selectedRoute) {
      toast.error("Invalid bus selection");
      return;
    }

    try {
      await dispatch(
        assignBusToStudent({
          admission_no: String(studentId),
          bus_id: Number(selectedRoute.id),
          bus_name: selectedRoute.bus_name,
          start_date: startDate,
        })
      ).unwrap();

      toast.success(`Bus ${selectedRoute.bus_name} assigned to ${studentName}`);
      setSelectedBusId("");
      setStartDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess(); // Refresh student list
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to assign bus");
    }
  };

  const handleRemoveBus = async () => {
    if (!currentAssignment || !endDate) {
      toast.error("Please select an end date");
      return;
    }

    try {
      await dispatch(
        removeBusFromStudent({
          studentId,
          end_date: endDate,
        })
      ).unwrap();

      toast.success(`Bus removed from ${studentName}`);
      setCurrentAssignment(null);
      setEndDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess(); // Refresh student list
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to remove bus");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bus Management - {studentName}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Assignment Status */}
        {currentAssignment && currentAssignment.bus_name && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Current Bus Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bus Name:</span>
                <Badge variant="outline">{currentAssignment.bus_name}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{currentAssignment.start_date}</span>
              </div>
              {currentAssignment.end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium text-red-600">{currentAssignment.end_date}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("assign")}
            className={`pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === "assign"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Bus className="w-4 h-4 inline mr-2" />
            Assign Bus
          </button>
          {currentAssignment && currentAssignment.bus_name && !currentAssignment.end_date && (
            <button
              onClick={() => setActiveTab("remove")}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === "remove"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <X className="w-4 h-4 inline mr-2" />
              Remove Bus
            </button>
          )}
        </div>

        {/* Assign Bus Tab */}
        {activeTab === "assign" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bus-select">Select Bus Route</Label>
              {loading ? (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-600">Loading bus routes...</p>
                </div>
              ) : routes.length > 0 ? (
                <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                  <SelectTrigger id="bus-select">
                    <SelectValue placeholder="Choose a bus..." />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route._id} value={route._id}>
                        {route.bus_name} ({route.route_number}) - {route.driver_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>No buses available</strong> - Admin needs to create bus routes first in the Bus Management page.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="start-date">Bus Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Bus fee will be charged from this month onwards</p>
            </div>

            {/* Bus Fee Information Card */}
            {selectedBusId && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Bus Fee Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student Class:</span>
                    <span className="font-medium">{className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Bus Fee:</span>
                    <Badge className="bg-green-600 text-white text-base px-3 py-1">
                      ₹ {busFeeAmount}
                    </Badge>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-sm text-gray-600">Fee Period:</span>
                    <span className="text-sm font-medium">April to March (Academic Year)</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Remove Bus Tab */}
        {activeTab === "remove" && currentAssignment && currentAssignment.bus_name && (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                🚨 <strong>Warning:</strong> Bus fee will be removed from the selected date onwards.
                Previous months' fees will not be affected.
              </p>
            </div>

            <div>
              <Label htmlFor="end-date">Bus End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Bus fee will stop from this month</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === "assign" && (
            <Button
              onClick={handleAssignBus}
              disabled={loading || !selectedBusId || !startDate}
            >
              {loading ? "Assigning..." : "Assign Bus"}
            </Button>
          )}
          {activeTab === "remove" && (
            <Button
              variant="destructive"
              onClick={handleRemoveBus}
              disabled={loading || !endDate}
            >
              {loading ? "Removing..." : "Remove Bus"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
