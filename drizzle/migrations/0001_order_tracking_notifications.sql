CREATE OR REPLACE FUNCTION public.handle_order_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history(order_id, status) VALUES (NEW.id, NEW.status);
    INSERT INTO public.notifications(user_id, title, body, kind, link_url)
    VALUES (NEW.user_id,
      'Order ' || NEW.order_number || ' ' || NEW.status,
      CASE NEW.status
        WHEN 'placed' THEN 'Thanks! We have received your order.'
        WHEN 'packed' THEN 'Your crackers are packed and ready to ship.'
        WHEN 'shipped' THEN 'Your order is on the way.'
        WHEN 'delivered' THEN 'Your order has been delivered. Happy festival!'
        ELSE 'Your order status changed to ' || NEW.status END,
      'order', '/order/' || NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_status_trigger ON public.orders;
CREATE TRIGGER orders_status_trigger AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_status();

CREATE OR REPLACE FUNCTION public.handle_new_arrival()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_new_arrival AND NEW.is_active AND (TG_OP = 'INSERT' OR NOT OLD.is_new_arrival) THEN
    INSERT INTO public.notifications(user_id, title, body, kind, link_url)
    SELECT p.id, 'New arrival: ' || NEW.name, 'Just landed in our store. Grab it before it sells out!', 'new_arrival', '/product/' || NEW.slug
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS products_new_arrival_trigger ON public.products;
CREATE TRIGGER products_new_arrival_trigger AFTER INSERT OR UPDATE OF is_new_arrival ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_new_arrival();

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT ON public.order_status_history TO authenticated;