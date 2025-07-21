"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, PackagePlus, Trash2, Send, CheckCircle } from "lucide-react";

const materials = [
    "Yard Waste",
    "Wood",
    "Metal",
    "RSM",
    "C&D Residue",
    "OCC",
    "Concrete",
    "C&D",
    "Mulch",
    "Unprocessed C&D",
    "Roofing",
    "Aggregates",
    "Asphalt",
    "Rock",
    "Fill"
] as const;

const siteLocations = [
    "1004", "2015", "3021", "4055"
] as const;

const formSchema = z.object({
  location: z.enum(siteLocations, { required_error: "Please select a site location." }),
  material: z.enum(materials, { required_error: "Please select a material." }),
  quantity: z.coerce.number().positive({ message: "Quantity must be a positive number." }),
  unit: z.enum(["TN", "YD"], { required_error: "Please select a unit." }),
});

type StagedItem = z.infer<typeof formSchema> & { id: string };

export default function InventoryLogger() {
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: undefined,
      material: undefined,
      quantity: 1,
      unit: undefined,
    },
  });

  function handleAddToStage(values: z.infer<typeof formSchema>) {
    const newItem: StagedItem = { ...values, id: crypto.randomUUID() };
    setStagedItems((prev) => [...prev, newItem]);
    form.reset();
  }

  function handleRemoveFromStage(id: string) {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleBatchSubmit() {
    setIsSubmitting(true);
    // Simulate API call and email sending for each item
    console.log("Submitting:", stagedItems);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStagedItems([]);
    setIsSubmitting(false);
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="text-primary" />
            Log New Inventory
          </CardTitle>
          <CardDescription>
            Fill in the details below and add items to the staging area.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddToStage)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Location</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {siteLocations.map(location => (
                             <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materials.map(material => (
                            <SelectItem key={material} value={material}>{material}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TN">Tons (TN)</SelectItem>
                          <SelectItem value="YD">Yards (YD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto bg-accent hover:bg-accent/90">Add to Stage</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <CardTitle>Staged Entries</CardTitle>
                <CardDescription>
                    Review items below before final submission. {stagedItems.length} item(s) staged.
                </CardDescription>
            </div>
            <Button
              onClick={handleBatchSubmit}
              disabled={stagedItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Submit All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {submissionSuccess && (
                 <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <p>Batch submitted successfully! Confirmation emails are on their way.</p>
                 </div>
            )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Location</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stagedItems.length > 0 ? (
                  stagedItems.map((item) => (
                    <TableRow key={item.id} className="transition-opacity duration-300">
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="font-medium">{item.material}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromStage(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No items staged for submission.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
