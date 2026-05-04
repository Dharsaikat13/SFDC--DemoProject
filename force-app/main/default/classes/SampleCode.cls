public with sharing class SampleCode {
    // Method to return a greeting message
    public static String getGreeting(String name) {
        return 'Hello, ' + name + '! Welcome to Apex.';
    }

    // Method to create a new Account record
    public static void createAccount(String accName) {
        Account acc = new Account();
        acc.Name = accName;
        insert acc;
    }
}