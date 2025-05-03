/**
 * Transaction History Component
 * Displays transaction history for credits in a table format
 */

import { RefreshCw, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Transaction } from './types';
import { formatDate, getTypeBadge } from './utils';

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Transaction History Component
 * Displays a table of transactions with their details
 */
export function TransactionHistory({ transactions, loading, error, refreshData }: TransactionHistoryProps) {
  return (
    <Card className="flex-1 overflow-hidden bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-gray-100">Transaction History</CardTitle>
          <CardDescription className="text-gray-400">
            View your Stripe transaction history and credits
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-400 hover:text-gray-300"
          onClick={refreshData}
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            {error}
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-gray-500 p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-600" />
            <p>No transaction history found</p>
            <p className="text-sm mt-1">Credits will appear here when you use the API</p>
          </div>
        ) : (
          <div className="relative overflow-auto max-h-[calc(100vh-360px)]">
            <Table>
              <TableHeader className="bg-gray-950 sticky top-0">
                <TableRow>
                  <TableHead className="text-gray-400">ID</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Description</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id} className="border-gray-800">
                    <TableCell className="text-gray-300 font-mono text-xs">
                      {transaction.id.substring(0, 12)}...
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(transaction.type)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-400 max-w-xs truncate">
                      {transaction.description || 'No description'}
                    </TableCell>
                    <TableCell className="text-gray-400 text-xs">
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 