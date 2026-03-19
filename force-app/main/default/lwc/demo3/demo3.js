
import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import CITY from '@salesforce/schema/Account.BillingCity';
import COUNTRY from '@salesforce/schema/Account.BillingCountry';
import {subscribe, MessageContext} from 'lightning/messageService';
import CASE_STUDY_CHANNEL from '@salesforce/messageChannel/CaseStudy__c';

export default class Demo3 extends NavigationMixin(LightningElement) {

    cityField=CITY;
    countryField=COUNTRY;

    accountId;
@wire(MessageContext)
messageContext;

connectedCallback(){
    subscribe(this.messageContext, CASE_STUDY_CHANNEL, (message) => {
        this.accountId = message.sid;
    });


}
handleView(){
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.accountId,
            objectApiName: 'Account',
            actionName: 'view'
        }
    });
}
handleEdit(){
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.accountId,
            objectApiName: 'Account',
            actionName: 'edit'
        }
    });
}

}