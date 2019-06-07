import React from 'react';
import { withFormik } from 'formik';
import { compose, withState } from 'recompose';
import Dinero from 'dinero.js';

Dinero.globalLocale = 'it-IT';

const Form = ({
  values,
  touched,
  errors,
  net,
  vat,
  discNet,
  discVat,
  total,
  handleChange,
  handleBlur,
  handleSubmit,
}) =>
  <form onSubmit={handleSubmit}>
    <h2> Car price calculator</h2>

    <div className="row">
      <div className="column column-50 column-offset-25">
        <label htmlFor="price">New car price</label>
        <input
          type="number"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.price}
          name="price"
        />
        {errors.price && touched.price && <p id="feedback">{errors.price}</p>}
      </div>
    </div>

    <div className="row">
      <div className="column column-50 column-offset-25">
        <label htmlFor="usedCar">Used car sell price</label>
        <input
          type="number"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.usedCar}
          name="usedCar"
        />
        {errors.usedCar && touched.usedCar && <p id="feedback">{errors.usedCar}</p>}
      </div>
    </div>

    <button type="submit">Submit</button>

    <hr />

    <p>This car costs <b>{net} + {vat} VAT</b>.</p>

    <p>With tax discount the price is <b>{discNet} + {discVat} VAT.</b></p>

    <p>The final total price after selling the used car is <b>{total}.</b></p>
  </form>;

export default compose(
  withState('net', 'setNet', 0),
  withState('vat', 'setVat', 0),
  withState('discNet', 'setDiscNet', 0),
  withState('discVat', 'setDiscVat', 0),
  withState('total', 'setTotal', 0),

  withFormik({
    mapPropsToValues: () => ({
      price: '',
      usedCar: '',
    }),

    validate: values => {
      const errors = {};

      if (!values.price) {
        errors.price = 'Required';
      }

      if (!values.usedCar) {
        errors.usedCar = 'Required';
      }

      return errors;
    },

    handleSubmit: (values, { props: {
      setNet,
      setVat,
      setDiscNet,
      setDiscVat,
      setTotal,
    } }) => {
      const gross = Dinero({ amount: values.price * 100, currency: 'EUR' });
      const usedCar = Dinero({ amount: values.usedCar * 100, currency: 'EUR' });

      // Calculate net
      const net = gross.divide(1.22)
      const formattedNet = net.toFormat('$0,0');
      setNet(formattedNet);

      // Calculate VAT
      const vat = gross.subtract(net)
      const formattedVat = vat.toFormat('$0,0');
      setVat(formattedVat);

      // Discounted NET
      const discNet = net.subtract(net.percentage(20));
      const formattedDiscNet = discNet.toFormat('$0,0');
      setDiscNet(formattedDiscNet);

      // Discounted VAT
      const discVat = vat.subtract(vat.percentage(40));
      const formattedDiscVat = discVat.toFormat('$0,0');
      setDiscVat(formattedDiscVat);

      // Total price
      const total = discNet.add(discVat).subtract(usedCar);
      const formattedTotal = total.toFormat('$0,0');
      setTotal(formattedTotal);
    },

    displayName: 'BasicForm',
  }),
)(Form);
