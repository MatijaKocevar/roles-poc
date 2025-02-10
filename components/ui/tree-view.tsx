"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Circle } from "lucide-react";

export interface TreeDataItem {
    id: string;
    name: string;
    children?: TreeDataItem[];
    actions?: React.ReactNode;
    onClick?: () => void;
}

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
    data: TreeDataItem[] | TreeDataItem;
    initialSelectedItemId?: string;
    onSelectChange?: (item: TreeDataItem | undefined) => void;
    expandAll?: boolean;
}

export function TreeView({
    data,
    initialSelectedItemId,
    onSelectChange,
    expandAll = false,
    className,
    ...props
}: TreeProps) {
    const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>(
        initialSelectedItemId
    );
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

    const items = Array.isArray(data) ? data : [data];

    const handleExpand = (itemId: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const renderItem = (item: TreeDataItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const isSelected = selectedItemId === item.id;

        return (
            <div key={item.id} className="select-none">
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent",
                        isSelected && "bg-accent",
                        level === 1 && "ml-6",
                        level === 2 && "ml-12"
                    )}
                >
                    <div className="w-6 h-6 flex items-center justify-center">
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleExpand(item.id)}
                            >
                                <ChevronRight
                                    className={cn(
                                        "h-4 w-4 transition-transform",
                                        isExpanded && "rotate-90"
                                    )}
                                />
                            </Button>
                        ) : (
                            <Circle className="h-2 w-2" />
                        )}
                    </div>
                    <span
                        onClick={() => {
                            setSelectedItemId(item.id);
                            onSelectChange?.(item);
                            item.onClick?.();
                        }}
                        className="flex-grow cursor-pointer"
                    >
                        {item.name}
                    </span>
                    {item.actions && <div className="ml-auto">{item.actions}</div>}
                </div>
                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {item.children?.map((child) => renderItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    React.useEffect(() => {
        if (expandAll) {
            const allIds = new Set<string>();
            const collectIds = (items: TreeDataItem[]) => {
                items.forEach((item) => {
                    if (item.children?.length) {
                        allIds.add(item.id);
                        collectIds(item.children);
                    }
                });
            };
            collectIds(items);
            setExpandedItems(allIds);
        }
    }, [expandAll, items]);

    return (
        <div className={cn("", className)} {...props}>
            {items.map((item) => renderItem(item, 0))}
        </div>
    );
}
