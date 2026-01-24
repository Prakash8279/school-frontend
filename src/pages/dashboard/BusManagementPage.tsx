import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchBusRoutes,
  createBusRoute,
  updateBusRoute,
  deleteBusRoute,
  fetchBusFeeConfig,
  updateBusFeeConfig,
  fetchAllBusAssignments,
  BusRoute,
  BusFeeConfig,
} from "@/store/slices/busSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Pencil, Bus, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const months = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

const BusManagementPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { routes, assignments, config, loading, error } = useSelector(
    (state: RootState) => state.bus
  );
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [activeTab, setActiveTab] = useState("routes");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);

  // Form states for bus routes
  const [formData, setFormData] = useState({
    bus_name: "",
    route_number: "",
    driver_name: "",
    driver_contact: "",
    capacity: 50,
    notes: "",
  });

  // Form states for config
  const [configForm, setConfigForm] = useState<BusFeeConfig | null>(null);

  useEffect(() => {
    dispatch(fetchBusRoutes());
    dispatch(fetchBusFeeConfig());
    dispatch(fetchAllBusAssignments());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setConfigForm(config);
    }
  }, [config]);

  const handleOpenDialog = (route?: BusRoute) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        bus_name: route.bus_name,
        route_number: route.route_number,
        driver_name: route.driver_name,
        driver_contact: route.driver_contact,
        capacity: route.capacity,
        notes: route.notes || "",
      });
    } else {
      setEditingRoute(null);
      setFormData({
        bus_name: "",
        route_number: "",
        driver_name: "",
        driver_contact: "",
        capacity: 50,
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRoute = async () => {
    if (!formData.bus_name || !formData.route_number) {
      toast.error("Bus name and route number are required");
      return;
    }

    try {
      if (editingRoute) {
        await dispatch(updateBusRoute({ _id: editingRoute._id, ...formData })).unwrap();
        toast.success("Bus route updated successfully");
      } else {
        await dispatch(createBusRoute(formData)).unwrap();
        toast.success("Bus route created successfully");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err || "Failed to save bus route");
    }
  };

  const handleDeleteRoute = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this bus route?")) {
      try {
        await dispatch(deleteBusRoute(id)).unwrap();
        toast.success("Bus route deleted");
      } catch (err: any) {
        toast.error(err || "Failed to delete route");
      }
    }
  };

  const handleSaveConfig = async () => {
    if (!configForm) return;

    try {
      await dispatch(updateBusFeeConfig({
        is_bus_fee_enabled: configForm.is_bus_fee_enabled,
        applicable_from_month: configForm.applicable_from_month,
        applicable_from_year: configForm.applicable_from_year,
        removable_from_month: configForm.removable_from_month,
        removable_from_year: configForm.removable_from_year,
      })).unwrap();
      toast.success("Bus fee configuration updated");
    } catch (err: any) {
      toast.error(err || "Failed to update config");
    }
  };

  if (role !== "admin") {
    return <div className="max-w-2xl mx-auto p-4 text-red-600">Access Restricted: Admin Only</div>;
  }

  if (loading && !routes.length) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bus Management</h1>
        <p className="text-gray-600 mt-1">Configure buses, routes, and fee settings</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Bus Routes</TabsTrigger>
          <TabsTrigger value="config">Fee Configuration</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* BUS ROUTES TAB */}
        <TabsContent value="routes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bus Routes</CardTitle>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Bus Route
              </Button>
            </CardHeader>
            <CardContent>
              {routes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bus routes configured. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus Name</TableHead>
                      <TableHead>Route #</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route._id}>
                        <TableCell className="font-medium">{route.bus_name}</TableCell>
                        <TableCell>{route.route_number}</TableCell>
                        <TableCell>{route.driver_name}</TableCell>
                        <TableCell>{route.driver_contact}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{route.capacity} seats</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{route.notes || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(route)}
                            >
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRoute(route._id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEE CONFIGURATION TAB */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Bus Fee Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-blue-900">Bus Fee Status</h3>
                  <p className="text-sm text-blue-700">Enable or disable bus fees globally</p>
                </div>
                {configForm && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={configForm.is_bus_fee_enabled}
                      onCheckedChange={(checked) => {
                        setConfigForm({
                          ...configForm,
                          is_bus_fee_enabled: checked === true,
                        });
                      }}
                    />
                    <span className="text-sm font-medium">
                      {configForm.is_bus_fee_enabled ? (
                        <span className="text-green-600">✓ Enabled</span>
                      ) : (
                        <span className="text-red-600">✗ Disabled</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {configForm && configForm.is_bus_fee_enabled && (
                <>
                  {/* Applicable From */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Bus Fee Applicable From (Month)</Label>
                      <Select
                        value={configForm.applicable_from_month}
                        onValueChange={(value) => {
                          setConfigForm({
                            ...configForm,
                            applicable_from_month: value,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Academic year starts from April</p>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={configForm.applicable_from_year}
                        onChange={(e) => {
                          setConfigForm({
                            ...configForm,
                            applicable_from_year: Number(e.target.value),
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Removable From (Optional) */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Label className="flex items-center gap-2 mb-3">
                      <Checkbox
                        checked={!!configForm.removable_from_month}
                        onCheckedChange={(checked) => {
                          setConfigForm({
                            ...configForm,
                            removable_from_month: checked ? "April" : null,
                            removable_from_year: checked ? new Date().getFullYear() : null,
                          });
                        }}
                      />
                      <span className="font-semibold">Remove Bus Fee From Date (Optional)</span>
                    </Label>

                    {configForm.removable_from_month && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                        <div>
                          <Label>Month</Label>
                          <Select
                            value={configForm.removable_from_month}
                            onValueChange={(value) => {
                              setConfigForm({
                                ...configForm,
                                removable_from_month: value,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={configForm.removable_from_year || ""}
                            onChange={(e) => {
                              setConfigForm({
                                ...configForm,
                                removable_from_year: Number(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-yellow-700 mt-2">
                      ℹ️ Leave unchecked if you never want to remove bus fees
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveConfig} disabled={loading}>
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                These settings control whether bus fees are charged globally and from which month.
                Individual students' assignments override these dates.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSIGNMENTS TAB */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Student Bus Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bus assignments yet. Assign buses to students from the Students page.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Admission #</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Bus Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment._id}>
                        <TableCell className="font-medium">{assignment.student_name}</TableCell>
                        <TableCell>{assignment.admission_no}</TableCell>
                        <TableCell>{assignment.classname}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.bus_name || "None"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{assignment.start_date}</TableCell>
                        <TableCell className="text-sm">
                          {assignment.end_date ? (
                            <span className="text-red-600">{assignment.end_date}</span>
                          ) : (
                            <span className="text-green-600">Ongoing</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!assignment.end_date ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700">Inactive</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Bus Route Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoute ? "Edit Bus Route" : "Add Bus Route"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bus Name</Label>
              <Input
                value={formData.bus_name}
                onChange={(e) =>
                  setFormData({ ...formData, bus_name: e.target.value })
                }
                placeholder="e.g., Bus-1, School Express"
              />
            </div>
            <div>
              <Label>Route Number</Label>
              <Input
                value={formData.route_number}
                onChange={(e) =>
                  setFormData({ ...formData, route_number: e.target.value })
                }
                placeholder="e.g., R-101"
              />
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input
                value={formData.driver_name}
                onChange={(e) =>
                  setFormData({ ...formData, driver_name: e.target.value })
                }
                placeholder="Driver's name"
              />
            </div>
            <div>
              <Label>Driver Contact</Label>
              <Input
                value={formData.driver_contact}
                onChange={(e) =>
                  setFormData({ ...formData, driver_contact: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: Number(e.target.value) })
                }
                min="1"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoute} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusManagementPage;
