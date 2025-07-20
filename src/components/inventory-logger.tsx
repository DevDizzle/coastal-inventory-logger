"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef, useEffect, useTransition } from "react";
import { suggestMaterials } from "@/ai/flows/suggest-materials";

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator";
import { Loader2, PackagePlus, Trash2, Send, CheckCircle, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";


const formSchema = z.object({
  material: z.string().min(2, { message: "Material must be at least 2 characters." }),
  quantity: z.coerce.number().positive({ message: "Quantity must be a positive number." }),
  unit: z.enum(["units", "kg", "liters"], { required_error: "Please select a unit." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
});

type StagedItem = z.infer<typeof formSchema> & { id: string };

export default function InventoryLogger() {
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, startSuggestionsTransition] = useTransition();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material: "",
      quantity: 1,
      unit: undefined,
      location: "",
    },
  });

  const materialValue = form.watch("material");

  useEffect(() => {
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }
    if (materialValue && materialValue.length > 1) {
        debounceTimeout.current = setTimeout(() => {
            startSuggestionsTransition(async () => {
                try {
                    const result = await suggestMaterials({ 
                        partialMaterialName: materialValue,
                        industry: "Coastal Engineering" // As specified in the logic plan
                    });
                    setSuggestions(result.suggestions);
                    if (result.suggestions.length > 0) {
                        setIsPopoverOpen(true);
                    }
                } catch (error) {
                    console.error("Failed to fetch material suggestions:", error);
                    setSuggestions([]);
                }
            });
        }, 300);
    } else {
        setSuggestions([]);
        setIsPopoverOpen(false);
    }
    return () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    };
  }, [materialValue]);

  function handleAddToStage(values: z.infer<typeof formSchema>) {
    const newItem: StagedItem = { ...values, id: crypto.randomUUID() };
    setStagedItems((prev) => [...prev, newItem]);
    form.reset();
    setSuggestions([]);
    setIsPopoverOpen(false);
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
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <FormField
                            control={form.control}
                            name="material"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Material</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input placeholder="e.g., Geotextile Fabric" {...field} autoComplete="off" />
                                        {isSuggestionsLoading && <Loader2 className="animate-spin h-4 w-4 absolute right-2 top-2.5 text-muted-foreground" />}
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        {suggestions.length > 0 && (
                            <div className="flex flex-col">
                                {suggestions.map((suggestion, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        className="justify-start font-normal"
                                        onClick={() => {
                                            form.setValue("material", suggestion);
                                            setIsPopoverOpen(false);
                                        }}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="units">Units</SelectItem>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="liters">Liters (L)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Warehouse A, Bay 3" {...field} />
                      </FormControl>
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
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stagedItems.length > 0 ? (
                  stagedItems.map((item) => (
                    <TableRow key={item.id} className="transition-opacity duration-300">
                      <TableCell className="font-medium">{item.material}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.location}</TableCell>
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
