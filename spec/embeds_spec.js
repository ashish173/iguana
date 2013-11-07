'use strict';

describe('Iguana.Embeds', function() {

    var Iguana, Item, SubItem;

    beforeEach(function() {
        module('Iguana');
        inject(function($injector, _Iguana_) {
            
            /* # Embedding documents
            You have an 'item' document that looks like this ...
            
                  {
                    id: 'some_id',
                    subItems: [
                        {prop: 'value'},
                        {prop: 'another_value'}
                    ]
                  }
            
            ... and you want to assign an iguana class both to the document
            and to each of the items in the 'subItems' array.
            
            You will need to call 'embedsMany' on the 'item' class
            and 'alias' on the 'subItems' class.
            */
            Iguana = _Iguana_;
            // ...
            Item = Iguana.subclass(function() {
                // The first argument to 'embedsMany' is the name of the property; the
                // second is the alias of the embedded document's class.
                this.embedsMany('subItems', 'SubItem');
            });
            
            SubItem = Iguana.subclass(function() {
                // This embedded class must be aliased so that Iguana can find it
                // when it needs to instantiate instances of the embedded document.
                // Since we used 'SubItem' as the second argument to embedsMany, we
                // also want to use 'SubItem' as the alias here.
                this.alias('SubItem');
                
                // 'embeddedIn' creates an instance method on the embedded document, in this case item(), which
                // will return the parent document. See [below](#embeddedIn)
                this.embeddedIn('item');
            });
        });
    });
    
    describe('embedsMany', function() {
        
        // ### Embedded arrays
        it('should instantiate instances of expected classes in an array', function() {
            var attrs = {
                subItems: [{a: 0}, {a: 1}]
            };
            var item = Item.new(attrs);
            angular.forEach(attrs.subItems, function(obj, i){
                var subitem = item.subItems[i];
                // Each element in the 'subItems' array should be
                // an instance of SubItem, and should have properties
                // matching the object that came over the api.
                expect(subitem).not.toBeUndefined();
                expect(subitem.constructor).toBe(SubItem);
                expect(subitem.a).toEqual(i);
            });
        });
        
        // ### Embedded objects
        it('should instantiate instances of expected classes in an object', function() {
            var attrs = {
                subItems: {
                    one: {a: 'one'}, 
                    another: {a: 'another'}
                }
            };
            var item = Item.new(attrs);
            angular.forEach(attrs.subItems, function(obj, name){
                var subitem = item.subItems[name];
                // Each value in the 'subItems' object should be
                // an instance of SubItem, and should have properties
                // matching the object that came over the api.
                expect(subitem).not.toBeUndefined();
                expect(subitem.constructor).toBe(SubItem);
                expect(subitem.a).toEqual(name);
            });
        });
    
    });
    
    // <a id="embeddedIn"></a>
    // ### embeddedIn
    // If you call 'embeddedIn' on the class of the embedded document,
    // then it will get a reference to it's parent.    
    describe('embeddedIn', function() {
        it('should make the parent accessible to the embedded document', function() {
            var attrs = {
                subItems: [{a: 0}]
            };
            var item = Item.new(attrs);
            var subItem = item.subItems[0];
            expect(subItem.item()).toBe(item);
        });
        
        // TODO: Right now, this reference to the parent is only set up when an instance of the
        // parent is created.  There is no way to add an embedded document and
        // have this reference set up.
        it('should not make the parent accessible if a new embedded document is added in code', function() {
            var item = Item.new({subItems: [{a: 0}]});
            var subItem = SubItem.new();
            item.subItems.push(subItem);
            //Since the first subItem was there when item was created,
            //it's item() function works.
            expect(item.subItems[0].item()).toBe(item);
            //Since the second item was added on subsequently, it's
            //item() function does not work.
            expect(item.subItems[1].item()).toBeUndefined();
        });
    });
    
});