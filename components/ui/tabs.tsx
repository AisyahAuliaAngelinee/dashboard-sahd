'use client';
import * as React from 'react';
import {Tabs as TabsPrimitive} from '@base-ui/react/tabs';
import {cn} from '@/lib/utils';
function Tabs({className,...props}:React.ComponentProps<typeof TabsPrimitive.Root>){return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2',className)} {...props}/>}
function TabsList({className,variant='default',...props}:React.ComponentProps<typeof TabsPrimitive.List>&{variant?:'default'|'line'}){return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn('inline-flex w-fit items-center gap-1 rounded-lg p-1',variant==='line'?'bg-transparent':'bg-muted',className)} {...props}/>}
function TabsTrigger({className,...props}:React.ComponentProps<typeof TabsPrimitive.Tab>){return <TabsPrimitive.Tab data-slot="tabs-trigger" className={cn('relative inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2',className)} {...props}/>}
function TabsContent({className,...props}:React.ComponentProps<typeof TabsPrimitive.Panel>){return <TabsPrimitive.Panel data-slot="tabs-content" className={cn('flex-1 outline-none',className)} {...props}/>}
export {Tabs,TabsList,TabsTrigger,TabsContent};
