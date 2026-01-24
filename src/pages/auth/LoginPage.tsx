import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, Box, Torus } from "@react-three/drei";

const FloatingShapes = () => {
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Box args={[1, 1, 1]} position={[-2, 0, 0]}>
          <meshStandardMaterial color="#A855F7" />
        </Box>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <Sphere args={[0.6, 32, 32]} position={[2, 1, -1]}>
          <meshStandardMaterial color="#EC4899" />
        </Sphere>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2.5}>
        <Torus args={[0.5, 0.2, 16, 100]} position={[0, -1, -2]}>
          <meshStandardMaterial color="#14B8A6" />
        </Torus>
      </Float>
      
      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={2}>
        <Box args={[0.7, 0.7, 0.7]} position={[3, -0.5, 0]} rotation={[0.5, 0.5, 0]}>
          <meshStandardMaterial color="#F59E0B" />
        </Box>
      </Float>

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#EC4899" />
      <pointLight position={[10, 5, 5]} intensity={0.6} color="#14B8A6" />
    </>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, userInfo } = useSelector((state: RootState) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from);
    }
  }, [userInfo, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success("Login Successful");
    } else {
      toast.error(result.payload as string || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      {/* 3D Canvas Background */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <FloatingShapes />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>
      
      {/* Decorative blurred circles */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse-color pointer-events-none" />
      <div className="fixed top-40 right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-color pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="fixed bottom-32 left-1/4 w-24 h-24 bg-tertiary/20 rounded-full blur-2xl animate-pulse-color pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="fixed bottom-20 right-1/3 w-36 h-36 bg-quaternary/20 rounded-full blur-3xl animate-pulse-color pointer-events-none" style={{ animationDelay: "1.5s" }} />
      
      <TopHeader />
      <Navbar />
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-40 pb-12">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-bold text-center text-blue-600">
              School Portal Login
            </CardTitle>
            <p className="text-sm text-center text-gray-500">
              Enter your credentials to access the management system
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-blue-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-blue-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold" type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;