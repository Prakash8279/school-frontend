import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { IndianRupee, Info, CheckCircle } from "lucide-react";

const FeeStructure = () => {
  const feeStructure = [
    { class: "Nursery", admission: "5,000", tuition: "1,500", annual: "2,000" },
    { class: "LKG", admission: "5,000", tuition: "1,500", annual: "2,000" },
    { class: "UKG", admission: "5,000", tuition: "1,500", annual: "2,000" },
    { class: "Class 1", admission: "6,000", tuition: "1,800", annual: "2,500" },
    { class: "Class 2", admission: "6,000", tuition: "1,800", annual: "2,500" },
    { class: "Class 3", admission: "6,000", tuition: "2,000", annual: "2,500" },
    { class: "Class 4", admission: "7,000", tuition: "2,000", annual: "3,000" },
    { class: "Class 5", admission: "7,000", tuition: "2,200", annual: "3,000" },
    { class: "Class 6", admission: "8,000", tuition: "2,500", annual: "3,500" },
    { class: "Class 7", admission: "8,000", tuition: "2,500", annual: "3,500" },
  ];

  const otherFees = [
    { name: "Registration Fee", amount: "500", note: "One time, Non-refundable" },
    { name: "Examination Fee", amount: "500", note: "Per term" },
    { name: "Computer Fee", amount: "300", note: "Monthly" },
    { name: "Activity Fee", amount: "200", note: "Monthly" },
    { name: "Transport Fee", amount: "800 - 1,500", note: "Monthly, based on distance" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <IndianRupee className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Fee Structure</h1>
              <p className="text-xl text-gray-600">Academic Year 2026-27</p>
            </div>

            {/* Main Fee Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <h2 className="text-xl font-bold text-center">Class-wise Fee Structure</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Class</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold">Admission Fee</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold">Monthly Tuition</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold">Annual Charges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feeStructure.map((fee, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{fee.class}</td>
                        <td className="px-6 py-4 text-center text-gray-600">₹{fee.admission}</td>
                        <td className="px-6 py-4 text-center text-gray-600">₹{fee.tuition}</td>
                        <td className="px-6 py-4 text-center text-gray-600">₹{fee.annual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Other Fees */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Other Fees</h2>
              <div className="space-y-4">
                {otherFees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-800">{fee.name}</h3>
                      <p className="text-sm text-gray-500">{fee.note}</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">₹{fee.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-amber-800 mb-3">Important Notes:</h3>
                  <ul className="space-y-2 text-amber-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>Fee is payable monthly by 10th of every month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>Late fee of ₹50 per week will be charged after due date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>Fee can be paid via Cash, Cheque, or Online Transfer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>10% sibling discount available on tuition fee</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default FeeStructure;
