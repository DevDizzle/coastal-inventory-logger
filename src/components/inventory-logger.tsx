"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useMemo } from "react";
import { format, nextSaturday, startOfToday } from "date-fns";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Loader2, PackagePlus, Trash2, Send, CheckCircle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { saveInventoryEntries } from "@/services/inventoryService";

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
    "1004", "1008", "1001", "1002", "1035", "1041", "1006", "1019", "1036","1026", "1034","1037"
] as const;

const formSchema = z.object({
  location: z.enum(siteLocations, { required_error: "Please select a site location." }),
  weekEnding: z.date({ required_error: "Please select a week ending date."}),
  material: z.enum(materials, { required_error: "Please select a material." }),
  quantity: z.coerce.number().positive({ message: "Quantity must be a positive number." }),
  unit: z.enum(["TN", "YD"], { required_error: "Please select a unit." }),
});

export type StagedItem = z.infer<typeof formSchema> & { id: string };

// We accept userEmail as a prop now
export default function InventoryLogger({ userEmail }: { userEmail?: string }) {
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { toast } = useToast();
  
  const defaultWeekEnding = useMemo(() => nextSaturday(startOfToday()), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: undefined,
      weekEnding: defaultWeekEnding,
      material: undefined,
      quantity: 1,
      unit: undefined,
    },
  });

  function handleAddToStage(values: z.infer<typeof formSchema>) {
    const newItem: StagedItem = { ...values, id: crypto.randomUUID() };
    setStagedItems((prev) => [...prev, newItem]);
    
    // Persist location, weekEnding, and unit. Reset material and quantity.
    form.reset({
        location: values.location,
        weekEnding: values.weekEnding,
        unit: values.unit,
        material: undefined,
        quantity: 1,
    });

    // Bring focus back to the material field for faster entry
    form.setFocus("material");
  }

  function handleRemoveFromStage(id: string) {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleBatchSubmit() {
    if (!userEmail) {
       toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "User email not found. Cannot submit entries.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await saveInventoryEntries(stagedItems, userEmail);
      setStagedItems([]);
      setSubmissionSuccess(true);
      form.reset({
          weekEnding: defaultWeekEnding,
          quantity: 1,
      });
      setTimeout(() => setSubmissionSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting batch:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not save inventory entries. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Fill in the details below and add items to the staging area. Week ending defaults to next Saturday.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddToStage)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Location</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
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
                  name="weekEnding"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Week Ending</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                    <p>Batch submitted successfully! Your data is ready for the next step.</p>
                 </div>
            )}
            
            {/* Mobile View: Card List */}
            <div className="md:hidden">
              {stagedItems.length > 0 ? (
                <div className="space-y-4">
                  {stagedItems.map((item) => (
                    <Card key={item.id} className="relative pt-6">
                       <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromStage(item.id)}
                          aria-label="Remove item"
                          className="absolute top-2 right-2 h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Material</span>
                            <span className="font-medium">{item.material}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Site</span>
                            <span>{item.location}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Week Ending</span>
                            <span>{format(item.weekEnding, "PPP")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Quantity</span>
                            <span>{item.quantity} {item.unit}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                    No items staged for submission.
                </div>
              )}
            </div>
            
            {/* Desktop View: Table */}
            <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Location</TableHead>
                  <TableHead>Week Ending</TableHead>
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
                      <TableCell>{format(item.weekEnding, "PPP")}</TableCell>
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
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
