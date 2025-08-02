import React, { useState } from 'react';
import AccountsSettlementPage from './AccountsSettlementPage';
import AddAccountPage from './AddAccountPage';
import EditAccountPage from './EditAccountPage';
import { type Account } from '@/services/accountsService';

type PageType = 'list' | 'add' | 'edit';

const AccountsMainPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('list');
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigateToAdd = () => {
    setCurrentPage('add');
  };

  const handleNavigateToEdit = (account: Account) => {
    setSelectedAccount(account);
    setCurrentPage('edit');
  };

  const handleBack = () => {
    setCurrentPage('list');
    setSelectedAccount(undefined);
    // Force refresh of the accounts list
    setRefreshKey(prev => prev + 1);
  };

  const handleSave = async (accountData?: Partial<Account>) => {
    // After saving, go back to list and refresh
    console.log('Account saved successfully:', accountData);
    setCurrentPage('list');
    setSelectedAccount(undefined);
    // Force refresh of the accounts list
    setRefreshKey(prev => prev + 1);
  };

  if (currentPage === 'add') {
    return (
      <AddAccountPage
        onBack={handleBack}
        onSave={handleSave}
      />
    );
  }

  if (currentPage === 'edit') {
    return (
      <EditAccountPage
        account={selectedAccount}
        onBack={handleBack}
        onSave={handleSave}
      />
    );
  }

  return (
    <AccountsSettlementPage
      key={refreshKey} // Force re-render when refreshKey changes
      onNavigateToAdd={handleNavigateToAdd}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};

export default AccountsMainPage;
