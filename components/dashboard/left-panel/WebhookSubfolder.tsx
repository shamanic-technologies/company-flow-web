'use client';

import * as React from "react";
import { useState } from 'react';
import { ChevronRight, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchWebhookResultItem, UtilityProvider, UtilityProviderEnum, WebhookStatus } from '@agent-base/types';
import { CrispIcon, StripeIcon } from '@/components/icons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "@/components/ui/sidebar";

// --- Helper Function to get Provider Icon ---
// Moved here as it's only used by WebhookSubfolder
const getProviderIcon = (providerId?: UtilityProviderEnum) => {
  switch (providerId) {
    case UtilityProviderEnum.CRISP:
      return CrispIcon;
    case UtilityProviderEnum.STRIPE:
      return StripeIcon;
    case UtilityProviderEnum.SLACK:
    case UtilityProviderEnum.AGENT_BASE:
    default:
      return Webhook;
  }
};

// --- Props Interface for WebhookSubfolder ---
export interface WebhookSubfolderProps {
  title: string;
  webhooks: SearchWebhookResultItem[];
  selectedWebhook: SearchWebhookResultItem | null;
  selectWebhookAndSetView: (webhook: SearchWebhookResultItem | null) => void;
}

// --- Webhook Subfolder Component ---
export default function WebhookSubfolder({
  title,
  webhooks,
  selectedWebhook,
  selectWebhookAndSetView
}: WebhookSubfolderProps) {
  // Type selectedWebhook explicitly here too for consistency
  const typedSelectedWebhook = selectedWebhook as SearchWebhookResultItem | null;
  const [isOpen, setIsOpen] = useState(title === 'Active'); // Default open 'Active'

  // Don't render the subfolder if there are no webhooks in this category
  if (webhooks.length === 0) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
             <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
            <span className="flex-1 text-left font-medium">{title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="pl-1">
            {webhooks.map((webhook: SearchWebhookResultItem) => {
              // Get the appropriate icon for this webhook
              const IconComponent = getProviderIcon(webhook.webhookProviderId as UtilityProviderEnum);
              return (
                <SidebarMenuItem key={webhook.id}>
                  <SidebarMenuButton
                    // Use the explicitly typed selected webhook
                    data-active={typedSelectedWebhook?.id === webhook.id}
                    className={cn(
                      "w-full justify-start text-xs h-6 px-1 gap-1",
                      "hover:text-accent-foreground",
                      "data-[active=true]:text-accent-foreground data-[active=true]:font-semibold"
                    )}
                    onClick={() => selectWebhookAndSetView(webhook)}
                  >
                    {/* Use the dynamic IconComponent */}
                    <IconComponent className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1 text-left">{webhook.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
} 