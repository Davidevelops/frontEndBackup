// "use client";

// import React, { useState } from "react";
// import { CirclePlus } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// export default function AddProduct() {
//   const [productName, setProductName] = useState("");

//   const handleAddProduct = () => {
//     console.log("New product:", productName);
//     setProductName("");
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           className="flex items-center gap-2 bg-purple-700 text-white hover:bg-purple-500 hover:text-white"
//         >
//           <CirclePlus size={18} />
//           Add Product
//         </Button>
//       </DialogTrigger>

//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add a New Product</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <Input
//             type="text"
//             placeholder="Enter product name"
//             value={productName}
//             onChange={(e) => setProductName(e.target.value)}
//           />

//           <Button
//             onClick={handleAddProduct}
//             disabled={!productName.trim()}
//             className="bg-purple-500"
//           >
//             Add Product
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
