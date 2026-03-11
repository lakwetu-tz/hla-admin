"use client"

import { useState } from "react"
import { Save, RotateCcw, Calendar, DollarSign, Mail, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { mockEventSettings, type EventSettings } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [settings, setSettings] = useState<EventSettings>(mockEventSettings)
  const [isSaving, setIsSaving] = useState(false)

  // Email templates
  const [offerTemplate, setOfferTemplate] = useState(`Dear {company_name},

Thank you for your application to exhibit at {event_name}.

We are pleased to offer you Stand {stand_number} in {hall_name} ({stand_size} m²).

Total Amount: ${settings.pricePerSqm * 24}
Deposit Required (40%): ${(settings.pricePerSqm * 24) * 0.4}
Payment Deadline: {deadline}

Please confirm your acceptance and complete the deposit payment by the deadline.

Best regards,
Horti Logistica Africa Team`)

  const [reminderTemplate, setReminderTemplate] = useState(`Dear {company_name},

This is a friendly reminder that your payment of ${(settings.pricePerSqm * 24) * 0.4} is due on {deadline}.

Please ensure timely payment to secure your stand at {event_name}.

Note: Late payments may incur a {late_fee_percentage}% fee.

Best regards,
Horti Logistica Africa Team`)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Settings Saved", {
      description: "Your changes have been applied successfully.",
    })
  }

  const handleReset = () => {
    setSettings(mockEventSettings)
    toast.success("Settings Reset", {
      description: "All settings have been reset to defaults.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure event parameters and system settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="event" className="space-y-6">
        <TabsList>
          <TabsTrigger value="event" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Event Details
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Event Details */}
        <TabsContent value="event">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Configure the main event details</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="event-name">Event Name</FieldLabel>
                  <Input
                    id="event-name"
                    value={settings.eventName}
                    onChange={(e) => setSettings({ ...settings, eventName: e.target.value })}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="start-date">Start Date</FieldLabel>
                    <Input
                      id="start-date"
                      type="date"
                      value={settings.eventDates.start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          eventDates: { ...settings.eventDates, start: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="end-date">End Date</FieldLabel>
                    <Input
                      id="end-date"
                      type="date"
                      value={settings.eventDates.end}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          eventDates: { ...settings.eventDates, end: e.target.value },
                        })
                      }
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Set pricing rules and payment terms</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Price per m²: ${settings.pricePerSqm}</FieldLabel>
                  <Slider
                    value={[settings.pricePerSqm]}
                    onValueChange={(value) => setSettings({ ...settings, pricePerSqm: value[0] })}
                    min={50}
                    max={500}
                    step={10}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Example: 24 m² stand = ${settings.pricePerSqm * 24}
                  </p>
                </Field>

                <Separator />

                <Field>
                  <FieldLabel>Deposit Required: {settings.depositPercentage}%</FieldLabel>
                  <Slider
                    value={[settings.depositPercentage]}
                    onValueChange={(value) => setSettings({ ...settings, depositPercentage: value[0] })}
                    min={10}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Deposit for 24 m² stand = ${(settings.pricePerSqm * 24 * settings.depositPercentage) / 100}
                  </p>
                </Field>

                <Separator />

                <Field>
                  <FieldLabel>Late Fee: {settings.lateFeePercentage}%</FieldLabel>
                  <Slider
                    value={[settings.lateFeePercentage]}
                    onValueChange={(value) => setSettings({ ...settings, lateFeePercentage: value[0] })}
                    min={0}
                    max={25}
                    step={1}
                  />
                </Field>

                <Field>
                  <FieldLabel>Payment Deadline (days after offer)</FieldLabel>
                  <Input
                    type="number"
                    value={settings.paymentDeadlineDays}
                    onChange={(e) =>
                      setSettings({ ...settings, paymentDeadlineDays: parseInt(e.target.value) || 14 })
                    }
                    min={1}
                    max={60}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="emails">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Offer Email Template</CardTitle>
                <CardDescription>
                  Email sent when an application is approved. Use placeholders like {"{company_name}"}, {"{event_name}"}, {"{stand_number}"}, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={offerTemplate}
                  onChange={(e) => setOfferTemplate(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Reminder Template</CardTitle>
                <CardDescription>
                  Email sent to remind exhibitors about pending payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reminderTemplate}
                  onChange={(e) => setReminderTemplate(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="font-medium">Application Version</h4>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="font-medium">Database Status</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="font-medium">Email Service</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    These actions are irreversible. Proceed with caution.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Clear All Logs
                    </Button>
                    <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Reset Database
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
