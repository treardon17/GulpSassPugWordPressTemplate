class ParallaxPage{
    constructor(){
        this.previousTop = window.pageYOffset || document.documentElement.scrollTop;
        this.parallaxContainers = [];
        let parallaxContainers = $('.parallax-container');
        for(let i = 0; i < parallaxContainers.length; i++){
            let parallaxElements = $(parallaxContainers[i]).find('.parallax-element');
            let titleHeadings = $(parallaxContainers[i]).find('.title-heading');
            this.parallaxContainers.push({container: parallaxContainers[i], elements: parallaxElements, titleHeadings: titleHeadings})
        }
        //set initial position of elements
        this.handleScroll();
        this.currentScrollDirection = 0;
    }

    //This should be placed inside of a $(window).scroll(()=>{})
    handleScroll(){
        if(this.parallaxContainers.length == 0) { return; };
        for(let i = 0; i < this.parallaxContainers.length; i++){
            let container = this.parallaxContainers[i].container;
            let elements = this.parallaxContainers[i].elements;

            //check if the element we're observing is in the current viewport
            this.checkElementInView(container,{
                //if the top of the window is in the middle of the element we're observing,
                //move the elements and change their opacity
                middleCallback: (percentComplete)=>{
                    this.moveElements(elements, -percentComplete*250);
                    this.opacityElements(elements, 1-percentComplete);
                }
            })
        }
    }

    moveElements(elements, margin){
        for(let i = 0; i < elements.length; i++){
            $(elements[i]).css({'bottom': margin + 'px'});
        }
    }

    opacityElements(elements, opacity){
        for(let i = 0; i < elements.length; i++){
            $(elements[i]).css({'opacity': opacity});
        }
    }

    //Checks to see if an element is above, within, or below the current scroll offset
    checkElementInView(elementSelector, cbObject){
        var top  = window.pageYOffset || document.documentElement.scrollTop;    //top of the window
        var bottom = top + $(window).height();                                  //bottom of the window

        var element = $(elementSelector);       //div being observed
        var height = $(element).outerHeight();  //height of the element
        var offset = $(element).offset().top;   //the top of the element

        //this will prevent the new top from being set 
        if(top % 2 == 0){
            //will be -1 if scrolling down, 1 if scrolling up
            if(this.previousTop < top){
                this.currentScrollDirection = -1;
            }else if(this.previousTop > top){
                this.currentScrollDirection = 1
            }
            //remember where the previous top is
            this.previousTop = top;
        }

        if(top >= offset && top < offset + height){
            //if the top of the viewport is in the middle of the element we're observing
            if(typeof cbObject.middleCallback === 'function'){
                let percentComplete = (top - offset)/height;
                cbObject.middleCallback(percentComplete);
            }
        }else if(top - offset < height){
            //if the viewport is above the view we're observing
            if(typeof cbObject.aboveCallback === 'function'){
                cbObject.aboveCallback();
            }
        }else if (top > offset + height){
            //if the viewport is below the view we're observing
            if(typeof cbObject.belowCallback === 'function'){
                cbObject.belowCallback();
            }
        }

        //if the bottom of the window is in the middle of the element we're observing
        if(bottom >= offset && bottom < offset+height){
            if(typeof cbObject.bottomProgressCallback === 'function'){
                let percentComplete = (bottom - offset)/height
                cbObject.bottomProgressCallback(percentComplete);
            }
        }
    }
}

//when the document has been loaded, make a parallax page
//call the handleScroll function on every scroll event
$(document).ready(()=>{
    let parallax = new ParallaxPage();
    var throttledUpdate = _.throttle(()=>{
        parallax.handleScroll();
    }, 10)

    $(window).scroll(()=>{ 
        throttledUpdate();
    });
});