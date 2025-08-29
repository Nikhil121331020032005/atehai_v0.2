'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { Liability } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EditLiabilityDialog } from './edit-liability-dialog';

type LiabilitiesTableProps = {
  liabilities: Liability[];
};

export function LiabilitiesTable({ liabilities }: LiabilitiesTableProps) {
  const { currency, deleteLiability } = useAppContext();
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Liabilities Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.length > 0 ? (
                  liabilities.map(liability => (
                    <TableRow key={liability.id}>
                      <TableCell className="font-medium">{liability.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {liability.type.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(liability.currentBalance, currency)}
                      </TableCell>
                      <TableCell>
                        {liability.interestRate ? `${liability.interestRate}%` : '-'}
                      </TableCell>
                      <TableCell>{liability.dueDate || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingLiability(liability)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Liability</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{liability.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteLiability(liability.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No liabilities tracked yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditLiabilityDialog
        liability={editingLiability}
        isOpen={!!editingLiability}
        onOpenChange={(open) => !open && setEditingLiability(null)}
      />
    </>
  );
}