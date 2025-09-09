// src/components/system-hours-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useMemo } from "react";
import { format, startOfToday } from "date-fns";

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
import { Loader2, PlusCircle, Trash2, Send, CheckCircle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const locations = ["1001","1002","1004","1007","1012","1018","1026","1034","1035","1036","1037","1039","1041","1042"] as const;
const metrics = ["System Runtime","Operational Downtime","Mechanical Downtime"] as const;

const formSchema = z.object({
  location: z.enum(locations, { required_error: "Please select a location." }),
  date: z.date({ required_error: "Please select a date." }),
  metric: z.enum(metrics, { required_error: "Please select a metric." }),
  hours: z.coerce.number().positive({ message: "Hours must be a positive number." }),
});

export type StagedHoursItem = z.infer<typeof formSchema> & { id: string };

export default function SystemHoursForm({ userEmail }: { userEmail?: string }) {
  const [stagedItems, setStagedItems] = useState<StagedHoursItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { toast } = useToast();

  const defaultDate = useMemo(() => startOfToday(), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: undefined,
      date: defaultDate,
      metric: undefined,
      hours: 1,
    },
  });

  function handleAdd(values: z.infer<typeof formSchema>) {
    const newItem: StagedHoursItem = { ...values, id: crypto.randomUUID() };
    setStagedItems((prev) => [...prev, newItem]);

    form.reset({
      location: values.location,
      date: values.date,
      metric: undefined,
      hours: 1,
    });
    form.setFocus("metric");
  }

  function handleRemove(id: string) {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSubmitBatch() {
    if (!userEmail) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "User email not found. Cannot submit entries.",
      });
      return;
    }
    if (stagedItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/save-system-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          items: stagedItems.map((s) => ({
            ...s,
            date: s.date instanceof Date ? s.date.toISOString() : s.date,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      setStagedItems([]);
      setSubmissionSuccess(true);
      form.reset({ date: defaultDate, hours: 1 });
      setTimeout(() => setSubmissionSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting system hours:", err);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not save system hours. Please try again.",
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
            <PlusCircle className="text-primary" />
            Log System Hours
          </CardTitle>
          <CardDescription>
            Enter system hour metrics and add them to the staging table before submitting.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MM/dd/yyyy")
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
                  name="metric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metric</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metrics.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" /> Add to Staging
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-primary" />
            Staged Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {stagedItems.length > 0 ? (
      {stagedItems.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-primary" />
              Staged Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stagedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{format(item.date, "MM/dd/yyyy")}</TableCell>
                    <TableCell>{item.metric}</TableCell>
                    <TableCell className="text-right">{item.hours}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No items staged for submission.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmitBatch} disabled={stagedItems.length === 0 || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit All
          </Button>
        </CardFooter>
      </Card>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSubmitBatch} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit All
            </Button>
          </CardFooter>
        </Card>
      )}

      {submissionSuccess && (
        <div className="flex items-center text-green-600 gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>System hours submitted successfully.</span>
        </div>
      )}
    </div>
  );
}
